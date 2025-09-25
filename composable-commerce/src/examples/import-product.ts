import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { ClientBuilder } from '@commercetools/ts-client';

// Load environment variables
dotenv.config();

const projectKey = process.env.CTP_PROJECT_KEY!;
const scopes = process.env.CTP_SCOPES!.split(' ');

// Configure import API client (different from main API)
const authMiddlewareOptions = {
  host: process.env.CTP_AUTH_URL!,
  projectKey,
  credentials: {
    clientId: process.env.CTP_CLIENT_ID!,
    clientSecret: process.env.CTP_CLIENT_SECRET!,
  },
  scopes,
  httpClient: fetch,
};

const httpMiddlewareOptions = {
  host: 'https://import.europe-west1.gcp.commercetools.com',
  httpClient: fetch,
};

// Create import client
const importClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .withLoggerMiddleware()
  .build();

// Sample product data for bulk import
// NOTE: Make sure the product types referenced here exist in your project
// You can create them via the Merchant Center or using the create-product-type.ts example
const sampleProducts = [
  {
    key: 'bulk-product-1',
    name: { en: 'Premium Headphones', de: 'Premium Kopfhörer' },
    productType: {
      typeId: 'product-type',
      key: 'electronics' // This product type must exist in your project
    },
    slug: { en: 'premium-headphones', de: 'premium-kopfhoerer' },
    description: {
      en: 'High-quality wireless headphones with noise cancellation',
      de: 'Hochwertige kabellose Kopfhörer mit Geräuschunterdrückung'
    },
    masterVariant: {
      key: 'headphones-master',
      sku: 'HEADPHONES-001',
      prices: [{
        key: 'headphones-price-usd',
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 29999, // $299.99
        },
      }],
      attributes: [
        {
          name: 'brand',
          type: 'text',
          value: 'TechAudio'
        }
      ],
      images: [
        {
          url: 'https://example.com/images/headphones-black.jpg',
          dimensions: { w: 800, h: 600 }
        }
      ]
    },
    variants: [
      {
        key: 'headphones-white',
        sku: 'HEADPHONES-002',
        prices: [{
          key: 'headphones-white-price-usd',
          value: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 29999,
          },
        }],
        attributes: [
          {
            name: 'brand',
            type: 'text',
            value: 'TechAudio'
          }
        ]
      }
    ],
    publish: true
  },
  {
    key: 'bulk-product-2',
    name: { en: 'Smart Watch', de: 'Smartwatch' },
    productType: {
      typeId: 'product-type',
      key: 'electronics'
    },
    slug: { en: 'smart-watch', de: 'smartwatch' },
    description: {
      en: 'Feature-rich smartwatch with health monitoring',
      de: 'Funktionsreiche Smartwatch mit Gesundheitsüberwachung'
    },
    masterVariant: {
      key: 'watch-master',
      sku: 'WATCH-001',
      prices: [{
        key: 'watch-price-usd',
        value: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 39999, // $399.99
        },
      }],
      attributes: [
        {
          name: 'brand',
          type: 'text',
          value: 'SmartTech'
        }
      ]
    },
    publish: true
  }
];

/**
 * Create an import container
 */
const createImportContainer = async (containerKey: string, resourceType: string) => {
  try {
    console.log(`📦 Creating import container: ${containerKey}`);

    const containerDraft = {
      key: containerKey,
      resourceType: resourceType as any
    };

    const response = await importClient.execute({
      uri: `/${projectKey}/import-containers`,
      method: 'POST',
      body: JSON.stringify(containerDraft),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const container = response.body;
    console.log('✅ Import container created successfully');
    return container;

  } catch (error) {
    // Check if container already exists
    if (error instanceof Error && 'body' in error) {
      try {
        const errorBody = (error as any).body;
        if (errorBody.statusCode === 409) {
          console.log('📦 Import container already exists, proceeding...');
          return { key: containerKey };
        }
      } catch (parseError) {
        // Ignore parse errors
      }
    }

    console.error('❌ Failed to create import container:', error);
    throw error;
  }
};

/**
 * Import products in bulk using commercetools Import API
 */
const importProductsBulk = async () => {
  const importContainerKey = 'bulk-product-import-' + Date.now();

  try {
    console.log('🚀 Starting bulk product import...');
    console.log(`📦 Import container: ${importContainerKey}`);
    console.log(`📊 Number of products: ${sampleProducts.length}`);

    // Step 1: Create import container
    await createImportContainer(importContainerKey, 'product-draft');

    // Step 2: Create the import request payload
    const importRequest = {
      type: 'product-draft' as const,
      resources: sampleProducts
    };

    // Step 3: Make the import API call
    const response = await importClient.execute({
      uri: `/${projectKey}/product-drafts/import-containers/${importContainerKey}`,
      method: 'POST',
      body: JSON.stringify(importRequest),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const importResult = response.body;

    console.log('✅ Import request submitted successfully!');
    console.log('📋 Import status:', JSON.stringify(importResult, null, 2));

    // Check operation statuses
    if (importResult.operationStatus) {
      importResult.operationStatus.forEach((status: any, index: number) => {
        console.log(`\n📦 Product ${index + 1} (${sampleProducts[index].key}):`);
        console.log(`   State: ${status.state}`);

        if (status.errors && status.errors.length > 0) {
          console.log('   ❌ Initial Validation Errors:');
          status.errors.forEach((error: any) => {
            console.log(`      - ${error.code}: ${error.message}`);

            // Show additional context for common errors
            if (error.code === 'InvalidField' && error.message.includes('product-type')) {
              console.log(`        💡 This likely means the product type "${sampleProducts[index].productType.key}" doesn't exist`);
              console.log(`        🔧 Create it in Merchant Center: Settings > Product Types`);
            }

            if (error.detailedErrorMessage) {
              console.log(`        Details: ${error.detailedErrorMessage}`);
            }
          });
        } else {
          console.log('   ✅ No initial validation errors');
          if (status.state === 'processing') {
            console.log('   ⏳ Import queued for processing...');
            console.log(`   🔍 Check detailed status with: npm run import-product status <container-key>`);
          }
        }
      });
    }

    return importResult;

  } catch (error) {
    console.error('❌ Import failed:', error);

    if (error instanceof Error && 'body' in error) {
      try {
        const errorDetails = (error as any).body;
        console.error('📋 Error details:', JSON.stringify(errorDetails, null, 2));
      } catch (parseError) {
        console.error('Raw error:', (error as any).body);
      }
    }

    throw error;
  }
};

/**
 * Check import operations status within a container
 */
const checkImportStatus = async (importContainerKey: string) => {
  try {
    console.log(`🔍 Checking import operations for container: ${importContainerKey}`);

    // Get import operations within the container
    const response = await importClient.execute({
      uri: `/${projectKey}/import-containers/${importContainerKey}/import-operations`,
      method: 'GET',
    });

    const operationsData = response.body;
    console.log('\n📊 Import Operations Summary:');
    console.log(`   Total operations: ${operationsData.total}`);
    console.log(`   Returned in this page: ${operationsData.count}`);

    if (operationsData.results && operationsData.results.length > 0) {
      console.log('\n📋 Individual Operation Status:');

      operationsData.results.forEach((operation: any, index: number) => {
        console.log(`\n   Operation ${index + 1}:`);
        console.log(`     Resource Key: ${operation.resourceKey}`);
        console.log(`     State: ${operation.state}`);
        console.log(`     Created: ${operation.createdAt}`);
        console.log(`     Last Modified: ${operation.lastModifiedAt}`);

        // Status interpretation
        switch (operation.state) {
          case 'processing':
            console.log('     ⏳ Status: Import in progress...');
            break;
          case 'imported':
            console.log('     ✅ Status: Successfully imported!');
            break;
          case 'validationFailed':
            console.log('     ❌ Status: Validation failed');
            break;
          case 'unresolved':
            console.log('     🔗 Status: Has unresolved references');
            break;
          case 'waitForMasterVariant':
            console.log('     ⏳ Status: Waiting for master variant');
            break;
          case 'rejected':
            console.log('     ❌ Status: Import rejected');
            break;
          case 'canceled':
            console.log('     ⏹️ Status: Import canceled');
            break;
          default:
            console.log(`     ❓ Status: Unknown (${operation.state})`);
        }
      });

      // Summary by state
      const stateCounts = operationsData.results.reduce((counts: any, op: any) => {
        counts[op.state] = (counts[op.state] || 0) + 1;
        return counts;
      }, {});

      console.log('\n📈 Status Summary:');
      Object.entries(stateCounts).forEach(([state, count]) => {
        const emoji = state === 'imported' ? '✅' :
                     state === 'processing' ? '⏳' :
                     state === 'validationFailed' ? '❌' : '❓';
        console.log(`   ${emoji} ${state}: ${count}`);
      });

    } else {
      console.log('\n❓ No import operations found. This could mean:');
      console.log('   - The import request hasn\'t been processed yet');
      console.log('   - There was an issue with the import submission');
      console.log('   - The container key is incorrect');
    }

    return operationsData;
  } catch (error) {
    console.error('❌ Failed to check import operations:', error);
    throw error;
  }
};

// Example usage and CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'bulk':
      importProductsBulk()
        .then((result) => {
          console.log('\n🎉 Bulk import completed!');
          console.log('💡 Tip: Products may take a few moments to appear in the Merchant Center');
          console.log('💡 You can check import status using: ts-node src/examples/import-product.ts status <container-key>');
        })
        .catch((error) => {
          console.error('💥 Bulk import failed:', error.message);
          process.exit(1);
        });
      break;

    case 'status':
      const containerKey = process.argv[3];
      if (!containerKey) {
        console.error('❌ Please provide import container key: npm run import-product status <container-key>');
        process.exit(1);
      }

      checkImportStatus(containerKey)
        .then(() => {
          console.log('\n✅ Status check completed!');
        })
        .catch((error) => {
          console.error('💥 Status check failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('🔧 commercetools Import API Example');
      console.log('\nUsage:');
      console.log('  ts-node src/examples/import-product.ts bulk      - Import new products (product-drafts)');
      console.log('  ts-node src/examples/import-product.ts status <container-key> - Check import status');
      break;
  }
}

export { importProductsBulk, checkImportStatus, createImportContainer };
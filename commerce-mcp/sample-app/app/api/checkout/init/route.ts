import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationHeader } from '@/app/lib/commercetools-auth';

/**
 * Initialize ACP Checkout Session
 *
 * This endpoint creates a checkout session with the ACP server
 * Following the Agentic Commerce Protocol specification
 */

export async function POST(req: NextRequest) {
  try {
    const { productId, sku, quantity = 1 } = await req.json();

    if (!productId && !sku) {
      return NextResponse.json(
        { error: 'Missing required field: productId or sku' },
        { status: 400 }
      );
    }

    const acpUrl = process.env.ACP_URL;
    if (!acpUrl) {
      return NextResponse.json(
        { error: 'ACP_URL not configured. Please set ACP_URL environment variable.' },
        { status: 500 }
      );
    }

    // Create checkout session request following ACP spec
    const checkoutRequest = {
      buyer: {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@example.com',
        phone_number: '15558901212'
      },
      items: [
        {
          id: sku || productId,
          quantity
        }
      ],
      fulfillment_address: {
        name: 'Test Customer',
        line_one: '789 Beacon St',
        line_two: 'Unit 4B',
        city: 'Boston',
        state: 'MA',
        country: 'US',
        postal_code: '02215'
      }
    };

    console.log('Initializing ACP checkout session:', checkoutRequest);

    // Get OAuth token for authentication
    const authHeaders = await getAuthorizationHeader();

    // Call ACP server to create checkout session
    const response = await fetch(`${acpUrl}/checkout_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(checkoutRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ACP checkout init error:', errorText);
      return NextResponse.json(
        { error: 'Failed to initialize checkout session', details: errorText },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    console.log('ACP checkout session created:', sessionData);

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      session: sessionData,
    });
  } catch (error) {
    console.error('Checkout initialization error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

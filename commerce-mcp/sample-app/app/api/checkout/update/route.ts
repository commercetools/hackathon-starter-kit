import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationHeader } from '@/app/lib/commercetools-auth';

/**
 * Update ACP Checkout Session
 *
 * This endpoint updates a checkout session with new information
 * (e.g., fulfillment address, shipping option, buyer details)
 * Following the Agentic Commerce Protocol specification
 */

export async function POST(req: NextRequest) {
  try {
    const { sessionId, buyer, fulfillmentOptionId, fulfillmentAddress } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
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

    // Build update request following ACP spec
    const updateRequest: {
      buyer?: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
      };
      fulfillment_option_id?: string;
      fulfillment_address?: {
        name: string;
        line_one: string;
        line_two?: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
      };
    } = {};

    if (buyer) {
      updateRequest.buyer = buyer;
    }

    if (fulfillmentOptionId) {
      updateRequest.fulfillment_option_id = fulfillmentOptionId;
    }

    if (fulfillmentAddress) {
      updateRequest.fulfillment_address = fulfillmentAddress;
    }

    console.log('Updating ACP checkout session:', { sessionId, updateRequest });

    // Get OAuth token for authentication
    const authHeaders = await getAuthorizationHeader();

    // Call ACP server to update checkout session
    const response = await fetch(`${acpUrl}/checkout_sessions/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(updateRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ACP checkout update error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update checkout session', details: errorText },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    console.log('ACP checkout session updated:', sessionData);

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      session: sessionData,
    });
  } catch (error) {
    console.error('Checkout update error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

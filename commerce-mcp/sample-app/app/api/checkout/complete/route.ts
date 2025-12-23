import { NextRequest, NextResponse } from 'next/server';
import { createSharedPaymentToken } from '@/app/lib/stripe';
import { getAuthorizationHeader } from '@/app/lib/commercetools-auth';

/**
 * Complete ACP Checkout Session
 *
 * This endpoint completes a checkout session by submitting payment information
 * Following the Agentic Commerce Protocol specification
 * https://developers.openai.com/commerce/specs/checkout
 */

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

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

    // Generate Stripe test payment token
    console.log('Generating Stripe test payment token...');
    const { paymentToken } = await createSharedPaymentToken();

    // Complete checkout session with payment token following ACP spec
    const completeRequest = {
      payment_data: {
        token: paymentToken,
        provider: 'stripe',
        billing_address: {
          name: 'Test Customer',
          line_one: '75 State Street',
          line_two: '',
          city: 'Boston',
          state: 'MA',
          postal_code: '02109',
          country: 'US'
        }
      },
      buyer: {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'Customer',
        phone_number: '15558901212'
      }
    };

    console.log('Completing ACP checkout session:', { sessionId });

    // Get OAuth token for authentication
    const authHeaders = await getAuthorizationHeader();

    // Call ACP server to complete checkout
    const response = await fetch(`${acpUrl}/checkout_sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(completeRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ACP checkout complete error:', errorText);
      return NextResponse.json(
        { error: 'Failed to complete checkout session', details: errorText },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    console.log('ACP checkout session completed:', sessionData);

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      status: sessionData.status,
      session: sessionData,
    });
  } catch (error) {
    console.error('Checkout completion error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

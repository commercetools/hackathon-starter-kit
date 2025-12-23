/**
 * Stripe Test Token Generation for Agentic Commerce Protocol (ACP)
 *
 * Based on: https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
 *
 * This utility generates test payment tokens that can be used with the ACP checkout flow.
 */

export interface StripeTestToken {
  token: string;
  type: 'card' | 'bank_account';
  last4?: string;
  brand?: string;
}

/**
 * Generates a test token for Stripe payment processing
 * In production, this would use the actual Stripe.js library
 * For testing, we generate mock tokens following Stripe's shared payment token format
 */
export async function generateStripeTestToken(): Promise<StripeTestToken> {
  // In a real implementation, you would use Stripe.js:
  // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  // const { token } = await stripe.createToken('card', cardElement);

  // For testing purposes, generate a mock token
  // Stripe shared payment tokens start with 'spt_' (not 'tok_')
  // Example: spt_1SUakgPshpOCyD4hP3tOOKgb
  const testToken: StripeTestToken = {
    token: `spt_${generateRandomString(24)}`,
    type: 'card',
    last4: '4242',
    brand: 'visa'
  };

  return testToken;
}

/**
 * Validates a Stripe token format
 * Shared payment tokens start with 'spt_'
 */
export function isValidStripeToken(token: string): boolean {
  return token.startsWith('spt_') && token.length > 10;
}

/**
 * Creates a shared payment token for ACP
 * This follows the ACP specification for payment tokens
 */
export async function createSharedPaymentToken(): Promise<{
  paymentToken: string;
  expiresAt: string;
}> {
  const stripeToken = await generateStripeTestToken();

  // In production, you would exchange the Stripe token for a shared payment token
  // via your backend API that communicates with Stripe

  // For testing, create a mock shared payment token
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  return {
    paymentToken: stripeToken.token,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Helper function to generate random strings for test tokens
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Test card numbers for Stripe testing
 * See: https://stripe.com/docs/testing#cards
 */
export const STRIPE_TEST_CARDS = {
  visa: '4242424242424242',
  visa_debit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  discover: '6011111111111117',
  declined: '4000000000000002',
  insufficient_funds: '4000000000009995',
};

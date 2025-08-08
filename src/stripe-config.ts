export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SpeUqdnfHYDwKF',
    priceId: 'price_1RtzBlGlGAiAprB7YGsaIIoz',
    name: 'One time use',
    description: 'One time use for gym entrance in a single day.',
    mode: 'payment'
  }
];
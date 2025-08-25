export interface Plan {
  id: 'free' | 'pro' | 'elite';
  name: string;
  priceLabel: string;
  features: string[];
  highlight?: string;
}

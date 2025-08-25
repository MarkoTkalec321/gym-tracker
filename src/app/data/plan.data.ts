import { Plan } from '../model/plan.model';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '0€',
    features: [
      'Basic workout planning',
      'Basic stats overview',
      'General nutrition articles'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '10€/month',
    features: [
      'Advanced graphs & analytics',
      'Predefined professional programs',
      'Detailed nutrition suggestions',
      'Export workout logs (PDF/Excel)'
    ],
    highlight: 'Most popular'
  },
  {
    id: 'elite',
    name: 'Elite',
    priceLabel: '15€/month',
    features: [
      'Personalized plans from a trainer',
      'Integration with smartwatches / trackers',
      'Calorie & macronutrient tracking',
      'Priority support',
      'Music recommendations for training sessions'
    ],
    highlight: 'All Pro features + premium'
  }
];

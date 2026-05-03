export type SubscriptionPlan = 'FREE' | 'REEFMASTER';

export interface User {
  id: number;
  email: string;
  username: string;
  plan: SubscriptionPlan;
  kwhPrice?: number;
  locale?: 'en' | 'de' | 'es';
  temperatureUnit?: 'C' | 'F';
  volumeUnit?: 'L' | 'GAL';
}

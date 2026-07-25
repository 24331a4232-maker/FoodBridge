import type { StorageMethod, FoodCondition, FreshnessStatus, PriorityLevel, FoodCategory } from '@/types';

export interface QualityInput {
  category: FoodCategory;
  preparationTime: string;
  expiryTime: string;
  storageMethod: StorageMethod;
  foodTemperature?: number | null;
  foodCondition: FoodCondition;
  quantity: number;
  quantityUnit: string;
}

export interface QualityResult {
  score: number;
  freshness: FreshnessStatus;
  freshnessLabel: string;
  freshnessDescription: string;
  estimatedMeals: number;
  recommendedRecipient: string;
  recipientIcon: string;
  priority: PriorityLevel;
  safetyTips: string[];
  isExpired: boolean;
  isCloseToExpiry: boolean;
}

const STORAGE_SHELF_LIFE_HOURS: Record<StorageMethod, number> = {
  room_temperature: 4,
  refrigerated: 24,
  frozen: 168,
};

const CONDITION_SCORE: Record<FoodCondition, number> = {
  fresh: 100,
  good: 75,
  average: 50,
};

const CATEGORY_MEAL_FACTOR: Record<FoodCategory, number> = {
  cooked: 1,
  raw: 0.8,
  packaged: 0.6,
  beverages: 0.3,
  bakery: 0.7,
  other: 0.5,
};

export function calculateFoodQuality(input: QualityInput): QualityResult {
  const now = Date.now();
  const prepTime = input.preparationTime ? new Date(input.preparationTime).getTime() : now;
  const expiryTime = input.expiryTime ? new Date(input.expiryTime).getTime() : now + STORAGE_SHELF_LIFE_HOURS[input.storageMethod] * 3600 * 1000;

  const totalWindowMs = Math.max(1, expiryTime - prepTime);
  const remainingMs = expiryTime - now;
  const remainingRatio = Math.max(0, remainingMs / totalWindowMs);

  let freshness: FreshnessStatus;
  let freshnessLabel: string;
  let freshnessDescription: string;

  if (remainingMs <= 0) {
    freshness = 'expired';
    freshnessLabel = 'Expired';
    freshnessDescription = 'Not eligible for donation';
  } else if (remainingRatio <= 0.25) {
    freshness = 'consume_soon';
    freshnessLabel = 'Consume Soon';
    freshnessDescription = 'Donate quickly — close to expiry';
  } else {
    freshness = 'fresh';
    freshnessLabel = 'Fresh';
    freshnessDescription = 'Safe for donation';
  }

  let score = 0;
  score += CONDITION_SCORE[input.foodCondition] * 0.4;
  score += remainingRatio * 100 * 0.35;
  const storageBonus = input.storageMethod === 'refrigerated' ? 90 : input.storageMethod === 'frozen' ? 100 : 60;
  score += storageBonus * 0.15;
  const tempScore = input.foodTemperature != null
    ? (input.foodTemperature <= 5 ? 100 : input.foodTemperature <= 25 ? 70 : 40)
    : 70;
  score += tempScore * 0.1;
  score = Math.round(Math.max(0, Math.min(100, score)));

  if (freshness === 'expired') score = Math.min(score, 20);

  const qty = input.quantity || 0;
  const factor = CATEGORY_MEAL_FACTOR[input.category] ?? 0.5;
  let estimatedMeals: number;
  if (input.quantityUnit === 'servings') {
    estimatedMeals = Math.round(qty * factor);
  } else if (input.quantityUnit === 'kg') {
    estimatedMeals = Math.round(qty * 4 * factor);
  } else if (input.quantityUnit === 'liters') {
    estimatedMeals = Math.round(qty * 4 * factor);
  } else {
    estimatedMeals = Math.round(qty * factor);
  }
  estimatedMeals = Math.max(1, estimatedMeals);

  let recommendedRecipient: string;
  let recipientIcon: string;
  if (score >= 80 && estimatedMeals >= 50) {
    recommendedRecipient = 'Community Kitchen';
    recipientIcon = 'ChefHat';
  } else if (score >= 70 && estimatedMeals >= 30) {
    recommendedRecipient = 'Old Age Home';
    recipientIcon = 'Heart';
  } else if (score >= 60) {
    recommendedRecipient = 'Orphanage';
    recipientIcon = 'Baby';
  } else if (score >= 40) {
    recommendedRecipient = 'Shelter';
    recipientIcon = 'Home';
  } else {
    recommendedRecipient = 'Shelter';
    recipientIcon = 'Home';
  }

  let priority: PriorityLevel;
  if (freshness === 'expired') {
    priority = 'low';
  } else if (freshness === 'consume_soon' || estimatedMeals >= 100) {
    priority = 'high';
  } else if (freshness === 'fresh' && score >= 80) {
    priority = 'medium';
  } else {
    priority = 'medium';
  }

  const safetyTips: string[] = [
    'Keep refrigerated below 5°C.',
    'Deliver within the safe time window.',
    'Ensure the food is properly sealed.',
  ];
  if (input.storageMethod === 'frozen') safetyTips.push('Maintain frozen state until delivery.');
  if (input.storageMethod === 'room_temperature') safetyTips.push('Consume within 4 hours of preparation.');
  if (freshness === 'consume_soon') safetyTips.push('Prioritize immediate pickup — high priority donation.');

  return {
    score,
    freshness,
    freshnessLabel,
    freshnessDescription,
    estimatedMeals,
    recommendedRecipient,
    recipientIcon,
    priority,
    safetyTips,
    isExpired: freshness === 'expired',
    isCloseToExpiry: freshness === 'consume_soon',
  };
}

export function getFreshnessColor(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
    case 'consume_soon': return 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300';
    case 'expired': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  }
}

export function getFreshnessDot(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'bg-primary-500';
    case 'consume_soon': return 'bg-gold-500';
    case 'expired': return 'bg-red-500';
  }
}

export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'medium': return 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300';
    case 'low': return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-primary-600';
  if (score >= 60) return 'text-gold-600';
  if (score >= 40) return 'text-accent-600';
  return 'text-red-600';
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-primary-500 to-primary-500';
  if (score >= 60) return 'from-gold-500 to-yellow-500';
  if (score >= 40) return 'from-accent-500 to-gold-500';
  return 'from-red-500 to-red-500';
}

export function getFreshnessLabel(status: FreshnessStatus | null | undefined): string {
  if (!status) return 'Unknown';
  switch (status) {
    case 'fresh': return 'Fresh';
    case 'consume_soon': return 'Consume Soon';
    case 'expired': return 'Expired';
  }
}

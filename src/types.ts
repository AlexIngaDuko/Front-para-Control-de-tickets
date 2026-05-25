export type MealType = 'DESAYUNO' | 'ALMUERZO' | 'CENA';

export type ScanStatus = 
  | 'VALID_COMPLETED' 
  | 'DUPLICATE' 
  | 'OUT_OF_SCHEDULE' 
  | 'INVALID_CODE' 
  | 'SUSPENDED_WORKER';

export interface Worker {
  id: string;
  dni: string;
  names: string;
  lastNames: string;
  service: string;
  role: string;
  photoUrl: string;
  status: 'ACTIVE' | 'VACATION';
}

export interface ScanRecord {
  id: string;
  workerId: string;
  names: string;
  lastNames: string;
  dni: string;
  service: string;
  role: string;
  mealType: MealType;
  scanTime: string; // HH:MM:SS
  scanDate: string; // YYYY-MM-DD
  status: ScanStatus;
  statusMessage: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  authByAdmin?: boolean; // if scan was authorized out of schedule
}

export interface MealSchedule {
  type: MealType;
  label: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  calories: number;
  protein: number;
  carbs: number;
  menuName: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface NutritionMetrics {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  limitCalories: number;
  servedCount: number;
}

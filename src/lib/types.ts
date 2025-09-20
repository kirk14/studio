// src/lib/types.ts
export type User = {
  userID: string;
  name: string;
  phone: string;
  email: string;
  role: 'father' | 'mother' | 'son' | 'daughter' | 'cousin';
  personalInfo: {
    height: number;
    weight: number;
    BMI: number;
  };
  medicalCondition?: string;
  lifestyleHabits: {
    activityLevel: 'sedentary' | 'lightly active' | 'moderately active' | 'very active';
    sleepPattern?: string; // Not in form, but in schema
    workShift?: string; // Not in form, but in schema
  };
  dietaryPreferences: {
    vegOrNonVeg: 'vegetarian' | 'non-vegetarian';
    cuisine: string;
    restrictions?: string;
  };
  healthGoals: {
    goalType: 'weight loss' | 'muscle gain' | 'maintenance';
    targetWeight: number;
    targetDate: string;
  };
  familyID?: string;
};

export type Meal = {
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  recipe: string;
  prepTime: string;
};

export type DietPlan = {
  planID: string;
  userID: string;
  dailyPlan: {
    meals: Meal[];
  };
  timestamp: Date;
};

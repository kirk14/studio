import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z.object({
  // Step 1
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().min(10, "Please enter a valid phone number.").optional(),
  role: z.enum(["father", "mother", "son", "daughter", "cousin"], { required_error: "Please select a role." }),
  
  // Step 2
  height: z.coerce.number().positive("Height must be a positive number."), // in cm
  weight: z.coerce.number().positive("Weight must be a positive number."), // in kg
  medicalCondition: z.string().optional(),
  activityLevel: z.enum(["sedentary", "lightly active", "moderately active", "very active"], { required_error: "Please select your activity level." }),

  // Step 3
  vegOrNonVeg: z.enum(["vegetarian", "non-vegetarian"], { required_error: "Please select your dietary preference." }),
  cuisine: z.string().min(2, "Cuisine preference is required."),
  restrictions: z.string().optional(),
  goalType: z.enum(["weight loss", "muscle gain", "maintenance"], { required_error: "Please select a health goal." }),
  targetWeight: z.coerce.number().positive("Target weight must be a positive number."),
  targetDate: z.date({ required_error: "Please select a target date."}),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

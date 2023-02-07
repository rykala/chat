import { z } from "zod";
import { Problem } from "../types";

export const registerSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required").min(8, "Password must have more than 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const offsetPaginationSchema = z.object({
  offset: z.number().min(0),
  limit: z.number().min(0).max(50),
});

export const mapZodErrorsToInvalidInput = (error: z.ZodError, title?: string): Problem => {
  return {
    title: title ?? "Invalid input",
    invalidInputs: error.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
  };
};

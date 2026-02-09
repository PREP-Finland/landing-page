"use server";

import type { FormData } from "@/types/form";

interface SubmitResult {
  success: boolean;
  message: string;
}

export async function submitForm(data: FormData): Promise<SubmitResult> {
  try {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return { success: false, message: "Missing required contact fields." };
    }

    if (!data.fitnessGoal) {
      return { success: false, message: "Missing fitness goal." };
    }

    if (!data.acceptTerms) {
      return { success: false, message: "Terms must be accepted." };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email as string)) {
      return { success: false, message: "Invalid email address." };
    }

    // Log form data (integration endpoint added later)
    console.log("Form submission received:", {
      ...data,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: "Form submitted successfully." };
  } catch (error) {
    console.error("Form submission error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

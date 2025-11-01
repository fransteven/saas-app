import { subjectsColors } from "@/constants"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors]
}


export class ValidationError extends Error {
  public status = 400;
  public issues: unknown;

  constructor(message: string, issues?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currentYear = new Date().getFullYear();
export const isValidYear = (year: number) => {
  return year >= 1 && year <= currentYear;
};

// regular expressions
export const yearRegex = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "Must be a valid number.",
  })
  .transform((value) => Number(value))
  .refine(isValidYear, {
    message: `Year must be between 1 and ${currentYear}.`,
  });

  export const stringRegex = /^([A-Za-z0-9.():;\-\s,'"]+)?$/;
  export const numberRegex = /^[0-9]*$/;
  export const alphanumericRegex = /^[A-Za-z0-9\u002D\u2013\u2014]*$/;
  export const urlRegex =
    /^(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)?$/;
  export const quoteRegex = /^[A-Za-z0-9\s,.!?&()\-:;'"\[\]%+\/\u2013\u2014]*$/;
  export const citationRegex = /^[A-Za-z0-9\s,.&()\-:;'"’“”\[\]#%+\/*=]*$/;


import { z } from "zod";

export const quoteLibrarySchema = z.object({
  text: z.string(),
  bookTitle: z.string(),
  authorNames: z.string(),
  pageNumber: z.string().optional(),
  quotedBy: z.string().optional(),
  isImportant: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
});

export type Quote = z.infer<typeof quoteLibrarySchema>;

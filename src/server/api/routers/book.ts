import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  books,
  booksToAuthors,
  publishersToBooks,
  booksToGenres,
} from "~/server/db/schema";

// Create a bookRouter using createTRPCRouter
export const bookRouter = createTRPCRouter({
  // Define a "create" procedure for creating a book (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for book creation
      z.object({
        title: z.string(),
        publicationYear: z.string().optional(),
        isbn: z.string().optional(),
        publisherId: z.number(),
        summary: z.string().optional(),
        citation: z.string().optional(),
        sourceLink: z.string().optional(),
        rating: z.number().optional(),
        authorIds: z.array(z.number()).optional(),
        genreIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        // Insert a new book into the database
        const bookInsertion = await tx
          .insert(books)
          .values({
            title: input.title,
            publicationYear: input.publicationYear,
            isbn: input.isbn ?? null,
            summary: input.summary ?? null,
            citation: input.citation ?? null,
            sourceLink: input.sourceLink ?? null,
            rating: input.rating ?? null,
            publisherId: input.publisherId,
          })
          .execute();

        const bookId = Number(bookInsertion.insertId);
        if (isNaN(bookId)) {
          throw new Error("Failed to insert the book");
        }

        // Insert associations with authors
        if (input.authorIds) {
          for (const authorId of input.authorIds) {
            await tx
              .insert(booksToAuthors)
              .values({
                bookId: bookId,
                authorId: authorId,
              })
              .execute();
          }
        }

        // Insert association with publisher (if necessary)
        if (input.publisherId) {
          await tx
            .insert(publishersToBooks)
            .values({
              publisherId: input.publisherId,
              bookId: bookId,
            })
            .execute();
        }

        // Insert associations with genres
        if (input.genreIds) {
          for (const genreId of input.genreIds) {
            await tx
              .insert(booksToGenres)
              .values({
                bookId: bookId,
                genreId: genreId,
              })
              .execute();
          }
        }

        return bookId;
      });
    }),

  // Define a "getAll" procedure for fetching all books (query)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.books.findMany({});
  }),

  // Define a "getRandom" procedure for fetching a random book (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.books.findFirst({
      orderBy: (books, { asc }) => [asc(books.id)],
    });
  }),
});

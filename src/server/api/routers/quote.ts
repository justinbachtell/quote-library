import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  quotes,
  books,
  authors,
  booksToAuthors,
  quotesToAuthors,
  quotesToTopics,
  quotesToTags,
  quotesToTypes,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

type QuoteWithBookAndAuthors = {
  id: number;
  userId: string;
  text: string;
  bookId: number;
  pageNumber: string | null | undefined;
  context: string | null | undefined;
  quotedBy: number | null | undefined;
  isImportant: boolean | null;
  isPrivate: boolean | null;
  bookTitle: string;
  authorNames: string;
};

export const quoteRouter = createTRPCRouter({
  // Define a "create" procedure for creating a quote (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for creating quotes
      z.object({
        text: z.string(),
        bookId: z.number(),
        context: z.string().optional(),
        pageNumber: z.string().optional(),
        quotedBy: z.number().optional(),
        isImportant: z.boolean(),
        isPrivate: z.boolean(),
        authorIds: z.array(z.number()).optional(),
        topicIds: z.array(z.number()).optional(),
        tagIds: z.array(z.number()).optional(),
        typeIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        // Check if the user is logged in
        if (!ctx.session?.user.id) {
          throw new Error("You must be logged in to create a quote.");
        }

        // Insert the quote into the database
        const quoteInsertion = await tx
          .insert(quotes)
          .values({
            userId: ctx.session.user.id,
            text: input.text,
            bookId: input.bookId,
            context: input.context,
            pageNumber: input.pageNumber,
            quotedBy: input.quotedBy,
            isImportant: input.isImportant,
            isPrivate: input.isPrivate,
          })
          .execute();

        const quoteId = Number(quoteInsertion.insertId);
        if (isNaN(quoteId)) {
          throw new Error("Failed to insert the quote");
        }

        // Automatically associate authors with the quote based on the bookId
        if (input.bookId) {
          const authorsForBook = await tx
            .select({ authorId: booksToAuthors.authorId })
            .from(booksToAuthors)
            .where(eq(booksToAuthors.bookId, input.bookId));

          if (authorsForBook.length > 0 && authorsForBook[0] !== undefined) {
            for (const author of authorsForBook) {
              await tx
                .insert(quotesToAuthors)
                .values({
                  quoteId: quoteId,
                  authorId: author.authorId,
                })
                .execute();
            }
          }
        }

        // Insert associations with topics
        if (input.topicIds) {
          for (const topicId of input.topicIds) {
            await tx
              .insert(quotesToTopics)
              .values({
                quoteId: quoteId,
                topicId: topicId,
              })
              .execute();
          }
        }

        // Insert associations with tags
        if (input.tagIds) {
          for (const tagId of input.tagIds) {
            await tx
              .insert(quotesToTags)
              .values({
                quoteId: quoteId,
                tagId: tagId,
              })
              .execute();
          }
        }

        // Insert associations with types
        if (input.typeIds) {
          for (const typeId of input.typeIds) {
            await tx
              .insert(quotesToTypes)
              .values({
                quoteId: quoteId,
                typeId: typeId,
              })
              .execute();
          }
        }

        return quoteId;
      });
    }),

  // Define a "getAll" procedure for fetching all quotes (query)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.quotes.findMany({});
  }),

  // Define a "getRandom" procedure for fetching a random quote (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.quotes.findFirst({
      orderBy: (quotes, { asc }) => [asc(quotes.id)],
    });
  }),

  // Define a "getAuthors" procedure for fetching authors of a specific quote (query)
  getAuthors: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.quotesToAuthors.findMany({
        where: (quotesToAuthors, { eq }) => eq(quotesToAuthors.quoteId, input),
      });
    }),

  // Define a "getAllWithBooksAndAuthors" procedure for fetching quotes with book and author details (query)
  getAllWithBooksAndAuthors: publicProcedure.query(
    async ({ ctx }): Promise<QuoteWithBookAndAuthors[]> => {
      const quotesWithBooks = await ctx.db
        .select({
          id: quotes.id,
          userId: quotes.userId,
          text: quotes.text,
          bookId: quotes.bookId,
          bookTitle: books.title,
          pageNumber: quotes.pageNumber,
          context: quotes.context,
          quotedBy: quotes.quotedBy,
          isImportant: quotes.isImportant,
          isPrivate: quotes.isPrivate,
        })
        .from(quotes)
        .innerJoin(books, eq(quotes.bookId, books.id))
        .execute();

      const quotesWithAuthors: QuoteWithBookAndAuthors[] = [];

      for (const quote of quotesWithBooks) {
        const authorsForBook = await ctx.db
          .select({
            firstName: authors.firstName,
            lastName: authors.lastName,
          })
          .from(booksToAuthors)
          .innerJoin(authors, eq(booksToAuthors.authorId, authors.id))
          .where(eq(booksToAuthors.bookId, quote.bookId))
          .execute();

        quotesWithAuthors.push({
          ...quote,
          authorNames:
            authorsForBook
              .map((a) => `${a.firstName} ${a.lastName}`)
              .join(", ") || "Unknown Author(s)",
        });
      }

      return quotesWithAuthors;
    },
  ),
});

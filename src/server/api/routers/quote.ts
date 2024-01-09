import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  quotes,
  books,
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
  citation: string | null | undefined;
  pageNumber: string | null | undefined;
  context: string | null | undefined;
  quotedBy: number | null | undefined;
  isImportant: boolean | null;
  isPrivate: boolean | null;
  bookTitle: string;
  quoteAuthors: string[];
  quoteTopics: string[];
  quoteTags: string[];
  quoteTypes: string[];
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

  // Define a "update" procedure for updating a quote (mutation)
  // Define an "update" procedure for updating a quote (mutation)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        text: z.string().optional(),
        bookId: z.number().optional(),
        context: z.string().optional(),
        pageNumber: z.string().optional(),
        quotedBy: z.number().optional(),
        isImportant: z.boolean().optional(),
        isPrivate: z.boolean().optional(),
        topicIds: z.array(z.number()).optional(),
        tagIds: z.array(z.number()).optional(),
        typeIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        // Update the quote in the database
        await tx
          .update(quotes)
          .set({
            text: input.text,
            bookId: input.bookId,
            context: input.context,
            pageNumber: input.pageNumber,
            quotedBy: input.quotedBy,
            isImportant: input.isImportant,
            isPrivate: input.isPrivate,
          })
          .where(eq(quotes.id, input.id))
          .execute();

        // Update topics
        if (input.topicIds) {
          await tx
            .delete(quotesToTopics)
            .where(eq(quotesToTopics.quoteId, input.id))
            .execute();

          for (const topicId of input.topicIds) {
            await tx
              .insert(quotesToTopics)
              .values({
                quoteId: input.id,
                topicId: topicId,
              })
              .execute();
          }
        }

        // Update tags
        if (input.tagIds) {
          await tx
            .delete(quotesToTags)
            .where(eq(quotesToTags.quoteId, input.id))
            .execute();

          for (const tagId of input.tagIds) {
            await tx
              .insert(quotesToTags)
              .values({
                quoteId: input.id,
                tagId: tagId,
              })
              .execute();
          }
        }

        // Update types
        if (input.typeIds) {
          await tx
            .delete(quotesToTypes)
            .where(eq(quotesToTypes.quoteId, input.id))
            .execute();

          for (const typeId of input.typeIds) {
            await tx
              .insert(quotesToTypes)
              .values({
                quoteId: input.id,
                typeId: typeId,
              })
              .execute();
          }
        }

        return `Quote with ID ${input.id} was successfully updated.`;
      });
    }),

  // Define a "delete" procedure for deleting a quote (mutation)
  delete: protectedProcedure
    .input(z.number()) // expects the ID of the quote to delete
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        if (!ctx.session?.user.id) {
          throw new Error("You must be logged in to delete a quote.");
        }

        // Delete associations in related tables first to maintain referential integrity
        await tx
          .delete(quotesToAuthors)
          .where(eq(quotesToAuthors.quoteId, input))
          .execute();
        await tx
          .delete(quotesToTopics)
          .where(eq(quotesToTopics.quoteId, input))
          .execute();
        await tx
          .delete(quotesToTags)
          .where(eq(quotesToTags.quoteId, input))
          .execute();
        await tx
          .delete(quotesToTypes)
          .where(eq(quotesToTypes.quoteId, input))
          .execute();

        // Now delete the quote itself
        const deletion = await tx
          .delete(quotes)
          .where(eq(quotes.id, input))
          .execute();

        // Check if the deletion was successful by ensuring deletion is not null
        if (!deletion) {
          throw new Error(`Failed to delete the quote with ID ${input}`);
        }

        return `Quote with ID ${input} was successfully deleted.`;
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
      // Fetch quotes with book details
      const quotesWithBooks = await ctx.db
        .select({
          id: quotes.id,
          userId: quotes.userId,
          text: quotes.text,
          bookId: quotes.bookId,
          bookTitle: books.title,
          citation: books.citation,
          pageNumber: quotes.pageNumber,
          context: quotes.context,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          quotedBy: quotes.quotedBy,
          isImportant: quotes.isImportant,
          isPrivate: quotes.isPrivate,
        })
        .from(quotes)
        .innerJoin(books, eq(quotes.bookId, books.id))
        .execute();

      // Fetch all relationships in separate queries
      const quotesToAuthorsData = await ctx.db.query.quotesToAuthors.findMany(
        {},
      );
      const quotesToTopicsData = await ctx.db.query.quotesToTopics.findMany({});
      const quotesToTagsData = await ctx.db.query.quotesToTags.findMany({});
      const quotesToTypesData = await ctx.db.query.quotesToTypes.findMany({});
      const booksToGenresData = await ctx.db.query.booksToGenres.findMany({});

      // Fetch all related entities in separate queries
      const authorsData = await ctx.db.query.authors.findMany({});
      const topicsData = await ctx.db.query.topics.findMany({});
      const tagsData = await ctx.db.query.tags.findMany({});
      const typesData = await ctx.db.query.types.findMany({});
      const genresData = await ctx.db.query.genres.findMany({});

      // Map through each quote and enrich with related data
      const quotesWithAuthors = quotesWithBooks.map((quote) => {
        // Fetch the quoted author's details
        let quotedAuthorName = "Unknown Author";
        if (quote.quotedBy) {
          const quotedAuthor = authorsData.find(
            (author) => author.id === quote.quotedBy,
          );
          if (quotedAuthor) {
            quotedAuthorName = `${quotedAuthor.firstName} ${quotedAuthor.lastName}`;
          }
        }

        const quoteAuthorsIds = quotesToAuthorsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.authorId);
        const quoteAuthors = authorsData
          .filter((author) => quoteAuthorsIds.includes(author.id))
          .map((author) => `${author.firstName} ${author.lastName}`);

        const quoteTopicsIds = quotesToTopicsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.topicId);
        const quoteTopics = topicsData
          .filter((topic) => quoteTopicsIds.includes(topic.id))
          .map((topic) => topic.name);

        const quoteTagsIds = quotesToTagsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.tagId);
        const quoteTags = tagsData
          .filter((tag) => quoteTagsIds.includes(tag.id))
          .map((tag) => tag.name);

        const quoteTypesIds = quotesToTypesData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.typeId);
        const quoteTypes = typesData
          .filter((type) => quoteTypesIds.includes(type.id))
          .map((type) => type.name);

        const quoteGenresIds = booksToGenresData
          .filter((qta) => qta.bookId === quote.bookId)
          .map((qta) => qta.genreId);
        const quoteGenres = genresData
          .filter((genre) => quoteGenresIds.includes(genre.id))
          .map((genre) => genre.name);

        return {
          ...quote,
          quotedAuthor: quotedAuthorName,
          quoteAuthors: quoteAuthors,
          quoteTopics: quoteTopics,
          quoteTags: quoteTags,
          quoteTypes: quoteTypes,
          quoteGenres: quoteGenres,
        };
      });

      return quotesWithAuthors;
    },
  ),
  getQuoteWithBookAndAuthorsById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }): Promise<QuoteWithBookAndAuthors[]> => {
      // Fetch quotes with book details
      const quotesWithBooks = await ctx.db
        .select({
          id: quotes.id,
          userId: quotes.userId,
          text: quotes.text,
          bookId: quotes.bookId,
          bookTitle: books.title,
          citation: books.citation,
          pageNumber: quotes.pageNumber,
          context: quotes.context,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          quotedBy: quotes.quotedBy,
          isImportant: quotes.isImportant,
          isPrivate: quotes.isPrivate,
        })
        .from(quotes)
        .where(eq(quotes.id, input))
        .innerJoin(books, eq(quotes.bookId, books.id))
        .execute();

      // Fetch all relationships in separate queries
      const quotesToAuthorsData = await ctx.db.query.quotesToAuthors.findMany(
        {},
      );
      const quotesToTopicsData = await ctx.db.query.quotesToTopics.findMany({});
      const quotesToTagsData = await ctx.db.query.quotesToTags.findMany({});
      const quotesToTypesData = await ctx.db.query.quotesToTypes.findMany({});
      const booksToGenresData = await ctx.db.query.booksToGenres.findMany({});

      // Fetch all related entities in separate queries
      const authorsData = await ctx.db.query.authors.findMany({});
      const topicsData = await ctx.db.query.topics.findMany({});
      const tagsData = await ctx.db.query.tags.findMany({});
      const typesData = await ctx.db.query.types.findMany({});
      const genresData = await ctx.db.query.genres.findMany({});

      // Map through each quote and enrich with related data
      const quotesWithAuthors = quotesWithBooks.map((quote) => {
        // Fetch the quoted author's details
        let quotedAuthorName = "Unknown Author";
        if (quote.quotedBy) {
          const quotedAuthor = authorsData.find(
            (author) => author.id === quote.quotedBy,
          );
          if (quotedAuthor) {
            quotedAuthorName = `${quotedAuthor.firstName} ${quotedAuthor.lastName}`;
          }
        }

        const quoteAuthorsIds = quotesToAuthorsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.authorId);
        const quoteAuthors = authorsData
          .filter((author) => quoteAuthorsIds.includes(author.id))
          .map((author) => `${author.firstName} ${author.lastName}`);

        const quoteTopicsIds = quotesToTopicsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.topicId);
        const quoteTopics = topicsData
          .filter((topic) => quoteTopicsIds.includes(topic.id))
          .map((topic) => topic.id);

        const quoteTagsIds = quotesToTagsData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.tagId);
        const quoteTags = tagsData
          .filter((tag) => quoteTagsIds.includes(tag.id))
          .map((tag) => tag.id);

        const quoteTypesIds = quotesToTypesData
          .filter((qta) => qta.quoteId === quote.id)
          .map((qta) => qta.typeId);
        const quoteTypes = typesData
          .filter((type) => quoteTypesIds.includes(type.id))
          .map((type) => type.id);

        const quoteGenresIds = booksToGenresData
          .filter((qta) => qta.bookId === quote.bookId)
          .map((qta) => qta.genreId);
        const quoteGenres = genresData
          .filter((genre) => quoteGenresIds.includes(genre.id))
          .map((genre) => genre.id);

        return {
          ...quote,
          quotedAuthor: quotedAuthorName,
          quoteAuthors: quoteAuthors,
          quoteTopics: quoteTopics,
          quoteTags: quoteTags,
          quoteTypes: quoteTypes,
          quoteGenres: quoteGenres,
        };
      });

      return quotesWithAuthors;
    }),

  // Define a "getQuoteById" procedure for fetching a quote by ID (query)
  getQuoteById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.quotes.findMany({
        where: (quotes, { eq }) => eq(quotes.id, input),
      });
    }),

  // Define a "getTopicById" procedure for fetching a topic by ID (query)
  getTopicById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.quotesToTopics.findMany({
      where: (quotesToTopics, { eq }) => eq(quotesToTopics.topicId, input),
    });
  }),

  // Define a "getTopicByName" procedure for fetching a topic by name (query)
  getTopicByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.topics.findMany({
        where: (topics, { eq }) => eq(topics.name, input),
      });
    }),

  // Define a "getTagById" procedure for fetching a tag by ID (query)
  getTagById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.quotesToTags.findMany({
      where: (quotesToTags, { eq }) => eq(quotesToTags.tagId, input),
    });
  }),

  // Define a "getTagByName" procedure for fetching a tag by name (query)
  getTagByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.tags.findMany({
        where: (tags, { eq }) => eq(tags.name, input),
      });
    }),

  // Define a "getTypeById" procedure for fetching a type by ID (query)
  getTypeById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.quotesToTypes.findMany({
      where: (quotesToTypes, { eq }) => eq(quotesToTypes.typeId, input),
    });
  }),

  // Define a "getTypeByName" procedure for fetching a type by name (query)
  getTypeByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.types.findMany({
        where: (types, { eq }) => eq(types.name, input),
      });
    }),
});
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { genres } from "~/server/db/schema";

// Create a genreRouter using createTRPCRouter
export const genreRouter = createTRPCRouter({
  // Define a "create" procedure for creating a genre (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for genre creation
      z.object({
        name: z.string(),
        description: z.string(),
        booksIds: z.array(z.number()).optional(),
        quotesIds: z.array(z.number()).optional(),
        topicsIds: z.array(z.number()).optional(),
        tagsIds: z.array(z.number()).optional(),
        typesIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        // Insert the genre into the database
        const genreInsertion = await tx.insert(genres).values({
          name: input.name,
          description: input.description,
        });

        const genreId = Number(genreInsertion.insertId);

        return genreId;
      });
    }),

  // Define a "getAll" procedure for fetching all genres (query)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.genres.findMany();
  }),

  // Define a "getRandom" procedure for fetching a random genre (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.genres.findFirst({
      orderBy: (genres, { asc }) => [asc(genres.id)],
    });
  }),

  // Define a "getById" procedure for fetching a genre by its ID (query)
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.genres.findFirst({
      where: (genres, { eq }) => eq(genres.id, input),
    });
  }),
});

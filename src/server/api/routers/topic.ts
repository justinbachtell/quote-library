import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { topics } from "~/server/db/schema";

export const topicRouter = createTRPCRouter({
  // Define a "create" procedure for creating a topic (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for creating topics
      z.object({
        name: z.string(),
        description: z.string(),
        quoteIds: z.array(z.number()).optional(),
        authorIds: z.array(z.number()).optional(),
        bookIds: z.array(z.number()).optional(),
        tagIds: z.array(z.number()).optional(),
        typeIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        // Insert the topic into the database
        const topicInsertion = await tx.insert(topics).values({
          name: input.name,
          description: input.description,
        });

        const topicId = Number(topicInsertion.insertId);

        return topicId;
      });
    }),

  // Define a "getAll" procedure for fetching all topics (query)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.topics.findMany();
  }),

  // Define a "getRandom" procedure for fetching a random topic (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.topics.findFirst({
      orderBy: (topics, { asc }) => [asc(topics.id)],
    });
  }),

  // Define a "getById" procedure for fetching a topic by its ID (query)
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.topics.findFirst({
      where: (topics, { eq }) => eq(topics.id, input),
    });
  }),
});

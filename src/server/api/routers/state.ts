import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { states, countriesToStates } from "~/server/db/schema";

export const stateRouter = createTRPCRouter({
  // Define a "create" procedure for creating a state (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for creating states
      z.object({
        name: z.string(),
        abbreviation: z.string(),
        countryId: z.number(),
        cityIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        // Insert the state into the database
        const stateInsertion = await tx.insert(states).values({
          name: input.name,
          abbreviation: input.abbreviation,
          countryId: input.countryId,
        });

        const stateId = Number(stateInsertion.insertId);

        // Insert association with the country
        if (input.countryId) {
          await tx.insert(countriesToStates).values({
            countryId: input.countryId,
            stateId,
          });
        }

        return stateId;
      });
    }),

  // Define a "getAll" procedure for fetching all states (query)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.states.findMany({
      orderBy: (states, { asc }) => [asc(states.name)],
    });
  }),

  // Define a "getRandom" procedure for fetching a random state (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.states.findFirst({
      orderBy: (states, { asc }) => [asc(states.id)],
    });
  }),

  // Define a "getCountryFromState" procedure for fetching the country associated with a state (query)
  getCountryFromState: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.states.findFirst({
        where: (states, { eq }) => eq(states.id, input),
      });
    }),
});

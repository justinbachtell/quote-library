import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { countries } from "~/server/db/schema";

// Create a countryRouter using createTRPCRouter
export const countryRouter = createTRPCRouter({
  // Define a "create" procedure for creating a country (mutation)
  create: protectedProcedure
    .input(
      // Define input validation schema for country creation
      z.object({
        name: z.string(),
        stateIds: z.array(z.number()).optional(),
        cityIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a database transaction to ensure data consistency
      return ctx.db.transaction(async (tx) => {
        try {
          // Insert the country into the database
          const countryInsertion = await tx.insert(countries).values({
            name: input.name,
          });

          const countryId = Number(countryInsertion.insertId);

          return countryId;
        } catch (error) {
          console.error(error);
          throw error;
        }
      });
    }),

  // Define a "getAll" procedure for fetching all countries (query)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.countries.findMany();
  }),

  // Define a "getRandom" procedure for fetching a random country (query)
  getRandom: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.countries.findFirst({
      orderBy: (countries, { asc }) => [asc(countries.id)],
    });
  }),
});

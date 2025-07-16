import { z } from "zod";

import {
  createTRPCRouter,
  // protectedProcedure, // REMOVE THIS LINE
  publicProcedure, // KEEP THIS LINE
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure // CHANGED from protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        // createdById: ctx.session.user.id, 
        // IMPORTANT: If 'createdById' in your schema.ts is still .notNull(),
        // you will get a database error. You either need to:
        // 1. Make 'createdById' nullable in schema.ts and run a migration.
        // 2. Provide a default value for 'createdById' here or in the schema.
        // 3. Remove the 'createdById' column from your schema if it's no longer needed.
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => { // CHANGED from protectedProcedure
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: publicProcedure.query(() => { // CHANGED from protectedProcedure
    return "you can now see this secret message!";
  }),
});
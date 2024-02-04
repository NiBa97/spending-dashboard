import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";



export const categoryMappingRuleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      hash: z.string().min(1), category: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      return ctx.db.categoryMappingRule.create({
        data: {
          hash: input.hash,
          category: input.category,
          userId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.categoryMappingRule.delete({
      where: {
        hash: input,
      },
    });
  }),
  update: protectedProcedure.input(z.object({ hash: z.string(), category: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    return ctx.db.categoryMappingRule.update({
      where: {
        hash : input.hash,
      },
      data: {
        category: input.category,
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.categoryMappingRule.findMany({
      where: { userId: ctx.session.user.id },
      take: 1000
    });
  }),

  upsert: protectedProcedure.input(z.object({ hash: z.string().min(1), category: z.string().min(1), })).mutation(async ({ ctx, input }) => {
    return ctx.db.categoryMappingRule.upsert({
      where: {
        hash: input.hash,
      },
      update: {
        category: input.category,
      },
      create: {
        hash: input.hash,
        category: input.category,
        userId: ctx.session.user.id,
      },
    });
  }),
});

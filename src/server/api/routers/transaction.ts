import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";


export const transactionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      hash: z.string().length(64),
      receiver: z.string().min(1),
      usage: z.string().min(1),
      amount: z.number(),
      categoryId: z.string(),
      date: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.create({
        data: {
          hash: input.hash,
          receiver: input.receiver,
          usage: input.usage,
          amount: input.amount,
          date: input.date,
          user: { 
            connect: {
              id: ctx.session.user.id
            }
          }
        },
        select: {
          hash: true,
          receiver: true,
          usage: true,
          amount: true,
          date: true,
        },
      });

      await ctx.db.transactionCategoryMapping.create({
        data: {
          hash: input.hash,
          categoryId: input.categoryId,
          userId: ctx.session.user.id,
        },
      });

      return transaction;
    }),
    createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          hash: z.string().length(64),
          receiver: z.string().min(1),
          usage: z.string(),
          amount: z.number(),
          date: z.date(),
          categoryId: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const transactions = input.map((transaction) => ({
        receiver: transaction.receiver,
        usage: transaction.usage,
        amount: transaction.amount,
        date: transaction.date,
        hash: transaction.hash,
        userId: ctx.session.user.id,
      }));

      await ctx.db.transaction.createMany({
        data: transactions,
      });

      const mappings = input.map((transaction) => ({
        hash: transaction.hash,
        categoryId: transaction.categoryId,
        userId: ctx.session.user.id,
      }));

      await ctx.db.transactionCategoryMapping.createMany({
        data: mappings,
      });

      return transactions;
    }),
  delete: protectedProcedure.input(z.string().length(64)).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction.delete({
      where: {
        hash: input,
      },
    });
  }),
  get: protectedProcedure.input(z.string().length(64)).query(async ({ ctx, input }) => {
    return ctx.db.transaction.findUnique({
      where: {
        hash: input,
      },
      select: {
        hash: true,
        receiver: true,
        usage: true,
        amount: true,
        date: true,
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.transaction.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        hash: true,
        receiver: true,
        usage: true,
        amount: true,
        date: true,
      },
      take: 5000
    });
  }),
});
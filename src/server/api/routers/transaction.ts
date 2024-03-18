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
      return ctx.db.transaction.create({
        data: {
          hash: input.hash,
          receiver: input.receiver,
          usage: input.usage,
          amount: input.amount,
          date: input.date,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
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
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          }
        },
      });
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
        categoryId:  transaction.categoryId,
        userId: ctx.session.user.id,
      }));

      return ctx.db.transaction.createMany({
        data: transactions,
      });
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
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        }
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
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      take: 5000
    });
  }),
});
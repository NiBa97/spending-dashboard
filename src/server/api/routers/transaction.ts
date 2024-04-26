import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";


export const transactionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      receiver: z.string().min(1),
      usage: z.string().min(1),
      amount: z.number(),
      categoryId: z.string().optional(),
      date: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction.create({
        data: {
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
          id:true,
          receiver: true,
          usage: true,
          amount: true,
          date: true,
        },
      });
    }),
    createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          receiver: z.string().min(1),
          usage: z.string(),
          amount: z.number(),
          date: z.date(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const createdTransactions = [];

    for (const transaction of input) {
      const createdTransaction = await ctx.db.transaction.create({
        data: {
          receiver: transaction.receiver,
          usage: transaction.usage,
          amount: transaction.amount,
          date: transaction.date,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      createdTransactions.push(createdTransaction);
    }

    return createdTransactions;
    }),
    update: protectedProcedure
    .input(z.object({id:z.string(), data: z.object({
      receiver: z.string().min(1).optional(),
      usage: z.string().min(1).optional(),
      amount: z.number().optional(),
      date: z.date().optional(),
    })})).mutation(async ({ ctx, input }) => {
      console.log(input);
      return ctx.db.transaction.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          receiver: input.data.receiver,
          usage: input.data.usage,
          amount: input.data.amount,
          date: input.data.date,
        },
      });
    }),
    updateCategory: protectedProcedure
    .input(z.object({id:z.string(), 
      category: z.object({id: z.string(), name:z.string(), color: z.string()}),
    })).mutation(async ({ ctx, input }) => {
      console.log(input);
      return ctx.db.transaction.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          category: {
            connect: {
              id: input.category.id,
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),
    removeTransactionCategory: protectedProcedure.input(z.object({id:z.string()})).mutation(async ({ ctx, input }) => {
      console.log(input);
      return ctx.db.transaction.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          category: {
            disconnect: true,
          },
        },
      });
}),
    
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction.delete({
      where: {
        id: input,
        userId: ctx.session.user.id,
      },
    });
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.transaction.findUnique({
      where: {
        id: input,
        userId: ctx.session.user.id, 
      },
      select: {
        id: true,
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
        id:true,
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
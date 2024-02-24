import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";



export const paymentScheduleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), amount: z.number(), startDate: z.date(), schedule: z.string() }))
    .mutation(async ({ ctx, input }) => {

      return ctx.db.paymentSchedule.create({
        data: {
          name: input.name,
          amount: input.amount,
          userId: ctx.session.user.id,
          startDate: input.startDate,
          schedule: input.schedule,
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    //delete all linked payments
    const payments = await ctx.db.payment.findMany({
      where: {
        paymentScheduleId: input
      }
    });

    if (payments.length > 0) {
      for (const payment of payments) {
        await ctx.db.payment.delete({
          where: {
            id: payment.id,
          },
        });
      }
    }

    return ctx.db.paymentSchedule.delete({
      where: {
        id: input,
      },
    });
  }),
  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string().min(1), amount: z.number(), schedule: z.string(), startDate: z.date(), lastRun: z.date().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.paymentSchedule.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        amount: input.amount,
        schedule: input.schedule,
        startDate: input.startDate,
        lastRun: input.lastRun
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.paymentSchedule.findMany({
      where: { userId: ctx.session.user.id },
      take: 1000
    });
  }),

});

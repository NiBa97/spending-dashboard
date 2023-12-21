import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";



export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), amount: z.number(), date: z.date(), isRecurring: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(ctx.session.user.id)
      return ctx.db.payment.create({
        data: {
          name: input.name,
          amount: input.amount,
          date: input.date,
          userId: ctx.session.user.id,
          isRecurring: input.isRecurring
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.payment.delete({
      where: {
        id: input,
      },
    });
  }),
  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string().min(1), amount: z.number(), date: z.date(), imgurl: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.payment.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        amount: input.amount,
        date: input.date,
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.payment.findMany({
      orderBy: { date: "desc" },
      where: { userId: ctx.session.user.id },
      take: 100
    });
  }),
  getForYear: protectedProcedure.input(z.object({ year: z.number() })).query(({ ctx, input }) => {
    return ctx.db.payment.findMany({
      orderBy: { date: "desc" },
      where: { userId: ctx.session.user.id, date: { gte: new Date(input.year, 0, 1), lte: new Date(input.year, 11, 31) } },
      take: 1000
    });
  }),
  getFirstPayment: protectedProcedure.query(({ ctx }) => {
    return ctx.db.payment.findFirst({
      orderBy: { date: "asc" },
      where: { userId: ctx.session.user.id },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

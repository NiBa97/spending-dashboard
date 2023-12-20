import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";



export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), amount: z.number(), date: z.date(), imgurl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(ctx.session.user.id)
      return ctx.db.payment.create({
        data: {
          name: input.name,
          amount: input.amount,
          date: input.date,
          imgurl: input.imgurl,
          userId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.payment.delete({
      where: {
        id: input,
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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

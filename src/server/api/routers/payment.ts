import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";



export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), amount: z.number(), description: z.string(), date: z.date(), imgurl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.payment.create({
        data: {
          owner: ctx.session.user.id,
          title: input.title,
          amount: input.amount,
          description: input.description,
          date: input.date,
          imgurl: input.imgurl,
          User: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.payment.findMany({
      orderBy: { date: "desc" },
      where: { User: { id: ctx.session.user.id } },
      take: 100
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

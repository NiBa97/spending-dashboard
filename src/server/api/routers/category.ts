import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      color: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          name: input.name,
          color: input.color,
          userId: ctx.session.user.id 
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.category.delete({
      where: {
        id: input,
      },
    });
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.category.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
  }),
  update: protectedProcedure.input(z.object({ id: z.string(), name: z.string(), color: z.string().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.category.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        color: input.color,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        color: true,
      },
      take: 1000
    });
  }),
  upsert: protectedProcedure.input(z.object({ id: z.string().optional(), name: z.string().min(1), color: z.string(), userId: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.category.upsert({
      where: {
        id: input.id,
      },
      update: {
        name: input.name,
        color: input.color,
        userId: input.userId,
      },
      create: {
        name: input.name,
        color: input.color,
        userId: input.userId,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
  }),
  getAllCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.count({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
  }),
});
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";



export const transactionCategoryMappingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      hash: z.string().min(1), categoryID: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
    

      // simulate a slow db call
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      return ctx.db.transactionCategoryMapping.create({
        data: {
          hash: input.hash,
          categoryID: input.categoryID, // Convert to number
          userId: ctx.session.user.id,
        },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.transactionCategoryMapping.delete({
      where: {
        hash: input,
      },
    });
  }),
  update: protectedProcedure.input(z.object({ hash: z.string(), categoryID: z.number()})).mutation(async ({ ctx, input }) => {
    return ctx.db.transactionCategoryMapping.update({
      where: {
        hash : input.hash,
      },
      data: {
        categoryID: input.categoryID,
      },

      include: {
        Category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.transactionCategoryMapping.findMany({
      where: { userId: ctx.session.user.id },
      take: 1000,
      include: {
        Category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }),

  upsert: protectedProcedure.input(z.object({ hash: z.string().min(1), categoryID: z.number(), })).mutation(async ({ ctx, input }) => {
    return ctx.db.transactionCategoryMapping.upsert({
      where: {
        hash: input.hash,
      },
      update: {
        categoryID: input.categoryID,
      },
      create: {
        hash: input.hash,
        categoryID: input.categoryID,
        userId: ctx.session.user.id,
      },
      include: {
        Category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }),
  getAllCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.transactionCategoryMapping.count({
      where: { userId: ctx.session.user.id },
    });
  }),
});

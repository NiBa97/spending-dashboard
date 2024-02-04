import { createTRPCRouter } from "~/server/api/trpc";
import { paymentRouter } from "./routers/payment";
import { paymentScheduleRouter } from "./routers/paymentSchedule";
import { transactionCategoryMappingRouter } from "./routers/transactionCategoryMapping";
import { categoryMappingRuleRouter } from "./routers/categoryMappingRule";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  payment: paymentRouter,
  paymentSchedule: paymentScheduleRouter,
  transactionCategoryMapping: transactionCategoryMappingRouter,
  categoryMappingRule: categoryMappingRuleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

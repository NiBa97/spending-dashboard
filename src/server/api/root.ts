import { createTRPCRouter } from "~/server/api/trpc";
import { paymentRouter } from "./routers/payment";
import { paymentScheduleRouter } from "./routers/paymentSchedule";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  payment: paymentRouter,
  paymentSchedule: paymentScheduleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";
import { useEffect, useState } from "react";

const MetaSidebar = () => {
  const { data: mapped_transaction_count } =
    api.transactionCategoryMapping.getAllCount.useQuery();
  return (
    <>
      <h2 className="text-2xl font-bold">Meta</h2>
      <div className="flex flex-col gap-2">
        <div>
          <h3 className="text-lg font-bold">Transaction Category Mappings</h3>
          <p>{mapped_transaction_count}</p>
        </div>
      </div>{" "}
    </>
  );
};

export default function Home() {
  const ctx = useSession();
  return (
    <>
      <div className="head-row flex items-center justify-between px-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hi {ctx.data?.user?.name}!
        </h1>
        <Link className="button" href="/import">
          Import transactions
        </Link>
      </div>

      <div className="flex">
        <div className="content bg-background w-3/4"></div>
        <div className="container  w-1/4 flex-row gap-5 bg-green-500 text-white">
          <MetaSidebar />
        </div>
      </div>
    </>
  );
}

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import CategorySelector from "~/components/categorySelector";
import type { Category } from "~/components/types";
import ImportSuite from "./import_suite";
import { ExportCategories, ExportTransactions } from "~/components/export";

const MetaSidebar = () => {
  return (
    <>
      <h2 className="text-2xl font-bold">Meta</h2>
      <div className="flex flex-col gap-2">
        <div>
          <h3 className="text-lg font-bold">Transaction Category Mappings</h3>
        </div>
      </div>{" "}
      <ExportTransactions></ExportTransactions>
      <ExportCategories></ExportCategories>
    </>
  );
};

export default function Home() {
  const ctx = useSession();
  //get all categories
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  return (
    <>
      <div className="head-row flex items-center justify-between px-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hi {ctx.data?.user?.name}!
        </h1>
        <Link className="button" href="/import_suite">
          Import transactions
        </Link>
      </div>

      <CategorySelector
        selectedCategory={selectedCategory}
        onChange={(category: Category | null) => setSelectedCategory(category)}
      />

      <ImportSuite />
      <div className="flex">
        <div className="content w-3/4 bg-background"></div>
        <div className="container  w-1/4 flex-row gap-5 bg-green-500 text-white">
          <MetaSidebar />
        </div>
      </div>
    </>
  );
}

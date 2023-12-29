import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { DataTable } from "./_components/tables/default/data-table";
import { columns } from "./_components/tables/default/columns";

export default async function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col">
          <QuoteTable />
        </div>
      </main>
    </>
  );
}

async function QuoteTable() {
  const session = await getServerAuthSession();

  // Get the user ID from the session
  const sessionUserId = session?.user.id;

  // Get all quotes with books and authors
  const quotesWithBookAndAuthors = (
    await api.quote.getAllWithBooksAndAuthors.query()
  )
    // Filter out private quotes that don't belong to the current user
    .filter((quote) => {
      return quote.isPrivate === false || quote.userId === sessionUserId;
    })
    // Map the quotes to the format expected by the table
    .map((quote) => ({
      ...quote,
      pageNumber: quote.pageNumber === null ? undefined : quote.pageNumber,
      quotedAuthor: quote.quotedAuthor ?? undefined,
      isPrivate: quote.isPrivate ?? undefined,
    }));

  return (
    <div className="w-full">
      <DataTable columns={columns} data={quotesWithBookAndAuthors} />
    </div>
  );
}

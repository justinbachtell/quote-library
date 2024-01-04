import type { NextPage } from "next";
import { Suspense } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { env } from "~/env";
import EditQuote from "~/app/_components/edit-quote";

/* export const runtime = "edge";
export const revalidate = 0; */

export default async function QuotePage({ params }: { params: { id: number } }) {
  const id = Number(params.id);

  const session = await getServerAuthSession();

  const sessionUserEmail = session?.user.email;
  const validUser = sessionUserEmail === env.ADMIN_EMAIL;

  const quote = (await api.quote.getQuoteWithBookAndAuthorsById.query(id))
    // Map the quote to the expected format
    .map((quote) => ({
      ...quote,
      pageNumber: quote.pageNumber === null ? undefined : quote.pageNumber,
      quotedBy: quote.quotedBy ?? undefined,
      isPrivate: quote.isPrivate ?? undefined,
      quoteAuthors: quote.quoteAuthors ?? undefined,
      quoteTopics: quote.quoteTopics ?? undefined,
      quoteTypes: quote.quoteTypes ?? undefined,
      quoteTags: quote.quoteTags ?? undefined,
      quoteGenres: quote.quoteGenres ?? undefined,
    }));

  return (
    <div className="container my-8 flex flex-col">
      {sessionUserEmail === env.ADMIN_EMAIL && (
          <EditQuote quoteId={quote[0]?.id} />
      )}
      {!validUser && (
        <Suspense fallback={<h1 className="text-large">Loading...</h1>}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">
                Quote from {quote[0]?.bookTitle}&nbsp;by&nbsp;
                {quote[0]?.quoteAuthors.join(", ")}
              </h1>
              <blockquote className="px-8 pt-8 text-xl">
                <p>"{quote[0]?.text}"</p>
                <p className="my-4 text-right italic">
                  - {quote[0]?.quoteAuthors.join(", ")}
                </p>
              </blockquote>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Pages</h2>
              <p>{quote[0]?.pageNumber}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Citation</h2>
              <p>{quote[0]?.citation}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Topics</h2>
              <ul>
                {quote[0]?.quoteTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Types</h2>
              <ul>
                {quote[0]?.quoteTypes.map((type) => <li key={type}>{type}</li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Tags</h2>
              <ul>
                {quote[0]?.quoteTags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Genres</h2>
              <ul>
                {quote[0]?.quoteGenres.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
}

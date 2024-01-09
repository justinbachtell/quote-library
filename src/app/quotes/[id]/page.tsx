import type { NextPage } from "next";
import { Suspense } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { env } from "~/env";
import { Button } from "@/components/ui/button";
import EditQuote from "~/app/_components/edit-quote";

/* export const runtime = "edge";
export const revalidate = 0; */

export default async function QuotePage({
  params,
}: {
  params: { id: number };
}) {
  const id = Number(params.id);

  if (!id) {
    throw new Error("No quote id provided");
  }

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
    }));

  const quoteTopics = quote[0]?.quoteTopics ?? [];
  const quoteTopicsArray = [];

  for (const topicId of quoteTopics) {
    const topic = await api.topic.getById.query(parseInt(topicId));
    if (topic) {
      quoteTopicsArray.push(topic);
    }
  }

  const quoteTypes = quote[0]?.quoteTypes ?? [];
  const quoteTypesArray = [];

  for (const typeId of quoteTypes) {
    const type = await api.type.getById.query(parseInt(typeId));
    if (type) {
      quoteTypesArray.push(type);
    }
  }

  const quoteTags = quote[0]?.quoteTags ?? [];
  const quoteTagsArray = [];

  for (const tagId of quoteTags) {
    const tag = await api.tag.getById.query(parseInt(tagId));
    if (tag) {
      quoteTagsArray.push(tag);
    }
  }

  return (
    <div className="container my-8 flex flex-col">
      {(sessionUserEmail === env.ADMIN_EMAIL ||
        env.NODE_ENV === "development") &&
        quote[0]?.id && (
          <div className="mb-8 flex justify-center">
            <EditQuote quoteId={quote[0].id} />
          </div>
        )}
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
          <div className="flex flex-row gap-4">
            <div className="flex w-1/3 flex-col gap-4">
              <h2 className="text-xl font-bold">Pages</h2>
              <p>{quote[0]?.pageNumber}</p>
            </div>
            <div className="flex w-2/3 flex-col gap-4">
              <h2 className="text-xl font-bold">Citation</h2>
              <p>{quote[0]?.citation}</p>
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              <h2 className="text-xl font-bold">Topics</h2>
              <ul>
                {quoteTopicsArray.map((topic) => (
                  <li key={topic.id}>{topic.name}</li>
                ))}
              </ul>
            </div>
            <div className="flex w-1/2 flex-col gap-4">
              <h2 className="text-xl font-bold">Types</h2>
              <ul>
                {quoteTypesArray.map((type) => (
                  <li key={type.id}>{type.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              <h2 className="text-xl font-bold">Tags</h2>
              <ul>
                {quoteTagsArray.map((tag) => (
                  <li key={tag.id}>{tag.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

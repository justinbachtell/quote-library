import { api } from "~/trpc/server";

export default async function Quotes() {
  const allQuotes = await api.quote.getAll.query();

  return (
    <>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">Quotes</h1>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {allQuotes.map((quote) => (
                  <div className="flex flex-col items-center">
                    <p className="my-10 truncate">{quote.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

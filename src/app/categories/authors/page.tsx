import { api } from "~/trpc/server";

export default async function Authors() {
  const allAuthors = await api.author.getAll.query();

  return (
    <>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">Authors</h1>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {allAuthors.map((author) => (
                  <div className="flex flex-col items-center">
                    <p className="my-10 truncate">
                      {author.firstName}&nbsp;{author.lastName}
                    </p>
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

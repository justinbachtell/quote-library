import { api } from "~/trpc/server";

export default async function Topics() {
  const allTopics = await api.topic.getAll.query();

  return (
    <>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">Topics</h1>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {allTopics.map((topic) => (
                  <div className="flex flex-col items-center">
                    <p className="my-10 truncate">{topic.name}</p>
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

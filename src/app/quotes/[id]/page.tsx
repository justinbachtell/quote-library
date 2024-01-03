import type { NextPage } from "next";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

/* export const runtime = "edge";
export const revalidate = 0; */

export interface Props {
  params: { id: number };
}

const QuotePage: NextPage<Props> = async ({ params }) => {
  // const session = await getServerAuthSession();

  // Get the user ID from the session
  //const sessionUserId = session?.user.id;

  //const quote = await api.quote.getQuoteById.query(params.id);

  return <div>Quote</div>;
};

export default QuotePage;

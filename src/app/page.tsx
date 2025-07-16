import Link from "next/link"; // Keep Link if you need the documentation links

import { LatestPost } from "~/app/_components/post"; // Keep if you plan to use it without authentication, otherwise remove
//import { auth } from "~/server/auth"; // Remove this if you're completely removing authentication
import { api, HydrateClient } from "~/trpc/server"; // Keep these for tRPC functionality

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth(); // Remove this line if you're completely removing authentication

  // if (session?.user) { // Remove this block if you're completely removing authentication
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
       hello world
      </main>
    </HydrateClient>
  );
}
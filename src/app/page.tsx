import Link from "next/link"; // Keep Link if you need the documentation links

import { LatestPost } from "~/app/_components/post"; // Keep if you plan to use it without authentication, otherwise remove
import { auth } from "~/server/auth"; // Remove this if you're completely removing authentication
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
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              {/* <p className="text-center text-2xl text-white"> // Remove or comment out this block
                {session && <span>Logged in as {session.user?.name}</span>}
              </p> */}
              {/* <Link // Remove or comment out this Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link> */}
            </div>
          </div>

          {/* {session?.user && <LatestPost />} */}
          {/* If LatestPost should be visible without authentication, remove the conditional rendering: */}
          {/* <LatestPost /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
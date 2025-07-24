import Link from "next"; // Keep Link if you need the documentation links

//import { LatestPost } from "~/app/_components/post"; // Keep if you plan to use it without authentication, otherwise remove
//import { auth } from "~/server/auth"; 
import { api, HydrateClient } from "~/trpc/server"; // Keep these for tRPC functionality
import  RecipeGeneratorApp from "./RecipeGeneratorAPP";

export default async function Home() {
  //const hello = await api.post.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        < RecipeGeneratorApp />
      </main>
    </HydrateClient>
  );
}
// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { type DefaultSession, type NextAuthConfig } from "next-auth";
// // import DiscordProvider from "next-auth/providers/discord"; // Remove or comment out this import

// import { db } from "~/server/db";
// import {
//   accounts,
//   sessions,
//   users,
//   verificationTokens,
// } from "~/server/db/schema";

// export const authConfig = {
//   providers: [
//     // No DiscordProvider here anymore!
//     /**
//      * ...add more providers here if you have others
//      */
//   ],
//   adapter: DrizzleAdapter(db, {
//     usersTable: users,
//     accountsTable: accounts,
//     sessionsTable: sessions,
//     verificationTokensTable: verificationTokens,
//   }),
//   callbacks: {
//     session: ({ session, user }) => ({
//       ...session,
//       user: {
//         ...session.user,
//         id: user.id,
//       },
//     }),
//   },
// } satisfies NextAuthConfig;
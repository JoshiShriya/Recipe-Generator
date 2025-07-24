import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";
// import { type AdapterAccount } from "next-auth/adapters"; // REMOVED

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `recipe_generator_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    // REMOVED: createdById: d.varchar({ length: 255 }).notNull().references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    // REMOVED: index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

// REMOVED: export const users = createTable("user", (d) => ({...}));
// REMOVED: export const usersRelations = relations(users, ({ many }) => ({...}));

// REMOVED: export const accounts = createTable("account", (...));
// REMOVED: export const accountsRelations = relations(accounts, ({ one }) => ({...}));

// REMOVED: export const sessions = createTable("session", (...));
// REMOVED: export const sessionsRelations = relations(sessions, ({ one }) => ({...}));

// REMOVED: export const verificationTokens = createTable("verification_token", (...));
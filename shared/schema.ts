import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional profile fields
  gender: varchar("gender"),
  age: integer("age"),
  mbti: varchar("mbti"),
  budget: varchar("budget"),
  timeAvailability: varchar("time_availability"),
  networkingPreference: boolean("networking_preference").default(false),
  uniqueHobbyPreference: boolean("unique_hobby_preference").default(false),
  blacklistedHobbies: text("blacklisted_hobbies").array(),
  bio: text("bio"),
  location: varchar("location"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  maxMembers: integer("max_members").notNull(),
  currentMembers: integer("current_members").default(0),
  meetingFrequency: varchar("meeting_frequency"),
  leaderId: varchar("leader_id").references(() => users.id),
  openChatLink: varchar("open_chat_link"),
  location: varchar("location"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role").default("member"), // "leader" or "member"
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hobbyRecommendations = pgTable("hobby_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  recommendationScore: integer("recommendation_score"),
  reasons: text("reasons").array(),
  estimatedCost: varchar("estimated_cost"),
  timeCommitment: varchar("time_commitment"),
  skillLevel: varchar("skill_level"),
  socialAspect: varchar("social_aspect"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  communityMemberships: many(communityMembers),
  ledCommunities: many(communities),
  chatMessages: many(chatMessages),
  hobbyRecommendations: many(hobbyRecommendations),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  leader: one(users, {
    fields: [communities.leaderId],
    references: [users.id],
  }),
  members: many(communityMembers),
  chatMessages: many(chatMessages),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  community: one(communities, {
    fields: [chatMessages.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const hobbyRecommendationsRelations = relations(hobbyRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [hobbyRecommendations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  gender: true,
  age: true,
  mbti: true,
  budget: true,
  timeAvailability: true,
  networkingPreference: true,
  uniqueHobbyPreference: true,
  blacklistedHobbies: true,
  bio: true,
  location: true,
  latitude: true,
  longitude: true,
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  category: true,
  maxMembers: true,
  meetingFrequency: true,
  openChatLink: true,
  location: true,
  latitude: true,
  longitude: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  communityId: true,
  content: true,
});

export const insertHobbyRecommendationSchema = createInsertSchema(hobbyRecommendations).omit({
  id: true,
  createdAt: true,
  userId: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type HobbyRecommendation = typeof hobbyRecommendations.$inferSelect;
export type InsertHobbyRecommendation = z.infer<typeof insertHobbyRecommendationSchema>;

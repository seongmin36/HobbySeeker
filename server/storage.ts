import {
  users,
  communities,
  communityMembers,
  chatMessages,
  hobbyRecommendations,
  type User,
  type UpsertUser,
  type InsertUser,
  type Community,
  type InsertCommunity,
  type CommunityMember,
  type ChatMessage,
  type InsertChatMessage,
  type HobbyRecommendation,
  type InsertHobbyRecommendation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<InsertUser>): Promise<User>;
  
  // Community operations
  createCommunity(community: InsertCommunity, leaderId: string): Promise<Community>;
  getCommunities(limit?: number, offset?: number): Promise<Community[]>;
  getCommunity(id: number): Promise<Community | undefined>;
  joinCommunity(communityId: number, userId: string): Promise<void>;
  leaveCommunity(communityId: number, userId: string): Promise<void>;
  getUserCommunities(userId: string): Promise<Community[]>;
  
  // Chat operations
  getChatMessages(communityId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage, userId: string): Promise<ChatMessage>;
  
  // Hobby recommendations
  createHobbyRecommendation(recommendation: InsertHobbyRecommendation, userId: string): Promise<HobbyRecommendation>;
  getUserHobbyRecommendations(userId: string): Promise<HobbyRecommendation[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImageUrl: profile.profileImageUrl,
        gender: profile.gender,
        age: profile.age,
        mbti: profile.mbti,
        budget: profile.budget,
        timeAvailability: profile.timeAvailability,
        networkingPreference: profile.networkingPreference,
        uniqueHobbyPreference: profile.uniqueHobbyPreference,
        blacklistedHobbies: profile.blacklistedHobbies ? profile.blacklistedHobbies : null,
        bio: profile.bio,
        location: profile.location,
        latitude: profile.latitude,
        longitude: profile.longitude,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createCommunity(community: InsertCommunity, leaderId: string): Promise<Community> {
    const [newCommunity] = await db
      .insert(communities)
      .values({
        ...community,
        leaderId,
        currentMembers: 1,
      })
      .returning();

    // Add leader as member
    await db.insert(communityMembers).values({
      communityId: newCommunity.id,
      userId: leaderId,
      role: "leader",
    });

    return newCommunity;
  }

  async getCommunities(limit = 50, offset = 0): Promise<Community[]> {
    return await db
      .select()
      .from(communities)
      .orderBy(desc(communities.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, id));
    return community;
  }

  async joinCommunity(communityId: number, userId: string): Promise<void> {
    await db.insert(communityMembers).values({
      communityId,
      userId,
      role: "member",
    });

    // Update member count
    await db
      .update(communities)
      .set({
        currentMembers: sql`${communities.currentMembers} + 1`,
      })
      .where(eq(communities.id, communityId));
  }

  async leaveCommunity(communityId: number, userId: string): Promise<void> {
    await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      );

    // Update member count
    await db
      .update(communities)
      .set({
        currentMembers: sql`${communities.currentMembers} - 1`,
      })
      .where(eq(communities.id, communityId));
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    const result = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        category: communities.category,
        maxMembers: communities.maxMembers,
        currentMembers: communities.currentMembers,
        meetingFrequency: communities.meetingFrequency,
        leaderId: communities.leaderId,
        openChatLink: communities.openChatLink,
        location: communities.location,
        latitude: communities.latitude,
        longitude: communities.longitude,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .innerJoin(communityMembers, eq(communities.id, communityMembers.communityId))
      .where(eq(communityMembers.userId, userId))
      .orderBy(desc(communityMembers.joinedAt));

    return result;
  }

  async getChatMessages(communityId: number, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.communityId, communityId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage, userId: string): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        ...message,
        userId,
      })
      .returning();
    return newMessage;
  }

  async createHobbyRecommendation(recommendation: InsertHobbyRecommendation, userId: string): Promise<HobbyRecommendation> {
    const [newRecommendation] = await db
      .insert(hobbyRecommendations)
      .values({
        name: recommendation.name,
        description: recommendation.description,
        recommendationScore: recommendation.recommendationScore,
        reasons: recommendation.reasons,
        estimatedCost: recommendation.estimatedCost,
        timeCommitment: recommendation.timeCommitment,
        skillLevel: recommendation.skillLevel,
        socialAspect: recommendation.socialAspect,
        userId,
      })
      .returning();
    return newRecommendation;
  }

  async getUserHobbyRecommendations(userId: string): Promise<HobbyRecommendation[]> {
    return await db
      .select()
      .from(hobbyRecommendations)
      .where(eq(hobbyRecommendations.userId, userId))
      .orderBy(desc(hobbyRecommendations.createdAt));
  }
}

export const storage = new DatabaseStorage();

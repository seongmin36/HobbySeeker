import {
  users,
  communities,
  communityMembers,
  chatMessages,
  hobbyRecommendations,
  lightningMeetups,
  lightningMeetupParticipants,
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
  type LightningMeetup,
  type InsertLightningMeetup,
  type LightningMeetupParticipant,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, asc, ne, like } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<InsertUser>): Promise<User>;
  
  // Community operations
  createCommunity(community: InsertCommunity, leaderId: string): Promise<Community>;
  getCommunities(limit?: number, offset?: number): Promise<Community[]>;
  getCommunity(id: number): Promise<Community | undefined>;
  getCommunitiesNearby(userLocation: string, excludeUserId: string, limit?: number, offset?: number): Promise<Community[]>;
  joinCommunity(communityId: number, userId: string): Promise<void>;
  leaveCommunity(communityId: number, userId: string): Promise<void>;
  getUserCommunities(userId: string): Promise<Community[]>;
  
  // Chat operations
  getChatMessages(communityId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage, userId: string): Promise<ChatMessage>;
  
  // Hobby recommendations
  createHobbyRecommendation(recommendation: InsertHobbyRecommendation, userId: string): Promise<HobbyRecommendation>;
  getUserHobbyRecommendations(userId: string): Promise<HobbyRecommendation[]>;
  
  // Lightning meetup operations
  createLightningMeetup(meetup: InsertLightningMeetup, organizerId: string): Promise<LightningMeetup>;
  getLightningMeetups(limit?: number, offset?: number): Promise<LightningMeetup[]>;
  getLightningMeetup(id: number): Promise<LightningMeetup | undefined>;
  joinLightningMeetup(meetupId: number, userId: string): Promise<void>;
  leaveLightningMeetup(meetupId: number, userId: string): Promise<void>;
  getUserLightningMeetups(userId: string): Promise<LightningMeetup[]>;
  
  // FCM operations
  updateUserFcmToken(userId: string, fcmToken: string): Promise<void>;
  getUsersInArea(location: string): Promise<User[]>;
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

  async getCommunitiesNearby(userLocation: string, excludeUserId: string, limit = 50, offset = 0): Promise<Community[]> {
    // Extract district (구) from user location
    const userDistrict = this.extractDistrict(userLocation);
    
    if (!userDistrict) {
      return [];
    }

    const communitiesList = await db.select().from(communities)
      .where(
        and(
          ne(communities.leaderId, excludeUserId), // Exclude user's own communities
          sql`location LIKE ${'%' + userDistrict + '%'}` // Match district
        )
      )
      .limit(limit)
      .offset(offset);
    
    return communitiesList;
  }

  private extractDistrict(location: string): string | null {
    // Extract district (구) from location string
    // Examples: "서울시 강남구", "부산시 해운대구", "강남구"
    const districtMatch = location.match(/([가-힣]+구)/);
    return districtMatch ? districtMatch[1] : null;
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

  // Lightning meetup operations
  async createLightningMeetup(meetup: InsertLightningMeetup, organizerId: string): Promise<LightningMeetup> {
    const [newMeetup] = await db
      .insert(lightningMeetups)
      .values({
        ...meetup,
        organizerId,
      })
      .returning();
    return newMeetup;
  }

  async getLightningMeetups(limit = 50, offset = 0): Promise<LightningMeetup[]> {
    const meetups = await db.select().from(lightningMeetups)
      .where(eq(lightningMeetups.isActive, true))
      .orderBy(asc(lightningMeetups.meetingTime))
      .limit(limit)
      .offset(offset);
    return meetups;
  }

  async getLightningMeetup(id: number): Promise<LightningMeetup | undefined> {
    const [meetup] = await db.select().from(lightningMeetups).where(eq(lightningMeetups.id, id));
    return meetup;
  }

  async joinLightningMeetup(meetupId: number, userId: string): Promise<void> {
    await db.insert(lightningMeetupParticipants).values({
      meetupId,
      userId,
    });
    
    // Update current participants count
    await db.update(lightningMeetups)
      .set({ 
        currentParticipants: sql`${lightningMeetups.currentParticipants} + 1`,
        updatedAt: new Date()
      })
      .where(eq(lightningMeetups.id, meetupId));
  }

  async leaveLightningMeetup(meetupId: number, userId: string): Promise<void> {
    await db.delete(lightningMeetupParticipants)
      .where(and(
        eq(lightningMeetupParticipants.meetupId, meetupId),
        eq(lightningMeetupParticipants.userId, userId)
      ));
    
    // Update current participants count
    await db.update(lightningMeetups)
      .set({ 
        currentParticipants: sql`${lightningMeetups.currentParticipants} - 1`,
        updatedAt: new Date()
      })
      .where(eq(lightningMeetups.id, meetupId));
  }

  async getUserLightningMeetups(userId: string): Promise<LightningMeetup[]> {
    const meetups = await db.select({
      id: lightningMeetups.id,
      title: lightningMeetups.title,
      description: lightningMeetups.description,
      category: lightningMeetups.category,
      location: lightningMeetups.location,
      meetingTime: lightningMeetups.meetingTime,
      maxParticipants: lightningMeetups.maxParticipants,
      currentParticipants: lightningMeetups.currentParticipants,
      organizerId: lightningMeetups.organizerId,
      isActive: lightningMeetups.isActive,
      createdAt: lightningMeetups.createdAt,
      updatedAt: lightningMeetups.updatedAt,
    })
    .from(lightningMeetups)
    .innerJoin(lightningMeetupParticipants, eq(lightningMeetups.id, lightningMeetupParticipants.meetupId))
    .where(eq(lightningMeetupParticipants.userId, userId))
    .orderBy(asc(lightningMeetups.meetingTime));
    
    return meetups;
  }

  // FCM operations
  async updateUserFcmToken(userId: string, fcmToken: string): Promise<void> {
    await db
      .update(users)
      .set({ fcmToken, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUsersInArea(location: string): Promise<User[]> {
    // Extract district from location (e.g., "서울시 관악구" -> "관악구")
    const district = this.extractDistrict(location);
    if (!district) {
      return [];
    }

    const result = await db
      .select()
      .from(users)
      .where(like(users.location, `%${district}%`));
    
    return result;
  }
}

export const storage = new DatabaseStorage();

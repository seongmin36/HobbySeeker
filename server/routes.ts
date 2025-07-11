import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateHobbyRecommendations } from "./gemini";
import { insertUserSchema, insertCommunitySchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Hobby recommendation routes
  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = {
        gender: user.gender || undefined,
        age: user.age || undefined,
        mbti: user.mbti || undefined,
        budget: user.budget || undefined,
        timeAvailability: user.timeAvailability || undefined,
        networkingPreference: user.networkingPreference || undefined,
        uniqueHobbyPreference: user.uniqueHobbyPreference || undefined,
        blacklistedHobbies: user.blacklistedHobbies || [],
      };

      const recommendations = await generateHobbyRecommendations(profile);
      
      // Save recommendations to database
      for (const rec of recommendations) {
        await storage.createHobbyRecommendation({
          name: rec.name,
          description: rec.description,
          recommendationScore: rec.recommendationScore,
          reasons: rec.reasons,
          estimatedCost: rec.estimatedCost,
          timeCommitment: rec.timeCommitment,
          skillLevel: rec.skillLevel,
          socialAspect: rec.socialAspect,
        }, userId);
      }

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getUserHobbyRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Community routes
  app.post('/api/communities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(communityData, userId);
      res.json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.get('/api/communities', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const communities = await storage.getCommunities(limit, offset);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get('/api/communities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const community = await storage.getCommunity(id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  app.post('/api/communities/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityId = parseInt(req.params.id);
      await storage.joinCommunity(communityId, userId);
      res.json({ message: "Successfully joined community" });
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.post('/api/communities/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityId = parseInt(req.params.id);
      await storage.leaveCommunity(communityId, userId);
      res.json({ message: "Successfully left community" });
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Failed to leave community" });
    }
  });

  app.get('/api/users/communities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ message: "Failed to fetch user communities" });
    }
  });

  // Chat routes
  app.get('/api/communities/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(communityId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          const { communityId, content, userId } = message;
          
          // Save message to database
          const newMessage = await storage.createChatMessage(
            { communityId, content },
            userId
          );

          // Broadcast to all connected clients
          const broadcastData = {
            type: 'chat',
            message: newMessage,
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastData));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}

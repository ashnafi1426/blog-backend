import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  followUser,
  unfollowUser,
  checkFollowing,
  getFollowers,
  getFollowing,
  getFollowCounts,
  followTopic,
  unfollowTopic,
  getFollowedTopics
} from "../controllers/followController.js";

const router = express.Router();

// User follow routes
router.post("/users/:id", authMiddleware, followUser);
router.delete("/users/:id", authMiddleware, unfollowUser);
router.get("/users/:id/check", authMiddleware, checkFollowing);
router.get("/users/:id/followers", getFollowers);
router.get("/users/:id/following", getFollowing);
router.get("/users/:id/counts", getFollowCounts);

// Topic follow routes
router.post("/topics/:id", authMiddleware, followTopic);
router.delete("/topics/:id", authMiddleware, unfollowTopic);
router.get("/topics/me", authMiddleware, getFollowedTopics);

export default router;

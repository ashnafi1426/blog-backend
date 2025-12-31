import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware.js";
import {
  getAllTopics,
  getTopicBySlug,
  getPostsByTopic,
  getTrendingTopics,
  createTopic
} from "../controllers/topicController.js";

const router = express.Router();

router.get("/", getAllTopics);
router.get("/trending", getTrendingTopics);
router.get("/:slug", optionalAuth, getTopicBySlug);
router.get("/:id/posts", getPostsByTopic);
router.post("/", authMiddleware, createTopic); // Admin only in production

export default router;

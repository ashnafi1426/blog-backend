import express from "express";
import { 
  createPost, 
  getPosts, 
  getPost,
  getFeed,
  getDrafts,
  updatePost, 
  publishPost,
  deletePost,
  searchPosts 
} from "../controllers/postsController.js";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/:id", optionalAuth, getPost);

// Protected routes
router.post("/", authMiddleware, createPost);
router.get("/user/feed", authMiddleware, getFeed);
router.get("/user/drafts", authMiddleware, getDrafts);
router.put("/:id", authMiddleware, updatePost);
router.post("/:id/publish", authMiddleware, publishPost);
router.delete("/:id", authMiddleware, deletePost);

export default router;

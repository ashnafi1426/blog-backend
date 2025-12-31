import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  clapComment,
} from "../controllers/commentsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Get comments for a post (public) - support both /post/:post_id and /:post_id
router.get("/post/:post_id", getComments);
router.get("/:post_id", getComments);

// Create comment (requires auth) - support both patterns
router.post("/post/:post_id", authMiddleware, createComment);
router.post("/:post_id", authMiddleware, createComment);

// Clap on a comment (requires auth)
router.post("/:id/clap", authMiddleware, clapComment);

// Update comment (requires auth + ownership)
router.put("/:id", authMiddleware, updateComment);

// Delete comment (requires auth + ownership)
router.delete("/:id", authMiddleware, deleteComment);

export default router;

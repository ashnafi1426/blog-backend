import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getUserProfileController,
  getUserByUsernameController,
  getUserPostsController,
  updateUserProfileController,
  changePasswordController,
  getUserBookmarksController,
  getUserHistoryController,
  getUserStatsController
} from "../../controllers/usersController/usersController.js";

const router = express.Router();

// Public routes
router.get("/username/:username", getUserByUsernameController);
router.get("/:id/posts", getUserPostsController);
router.get("/:id/stats", getUserStatsController);
router.get("/:id", getUserProfileController);

// Protected routes
router.put("/:id", authMiddleware, updateUserProfileController);
router.put("/:id/password", authMiddleware, changePasswordController);
router.get("/:id/bookmarks", authMiddleware, getUserBookmarksController);
router.get("/:id/history", authMiddleware, getUserHistoryController);

export default router;

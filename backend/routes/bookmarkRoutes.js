import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addBookmark,
  removeBookmark,
  checkBookmark,
  getBookmarks
} from "../controllers/bookmarkController.js";

const router = express.Router();

router.get("/", authMiddleware, getBookmarks);
router.get("/:id/check", authMiddleware, checkBookmark);
router.post("/:id", authMiddleware, addBookmark);
router.delete("/:id", authMiddleware, removeBookmark);

export default router;

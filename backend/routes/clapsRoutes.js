import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addClaps,
  removeClaps,
  getClapsCount,
  getUserClaps,
  getClappersList
} from "../controllers/clapsController.js";

const router = express.Router();

// Public
router.get("/:id/count", getClapsCount);
router.get("/:id/list", getClappersList);

// Protected
router.post("/:id", authMiddleware, addClaps);
router.delete("/:id", authMiddleware, removeClaps);
router.get("/:id/user", authMiddleware, getUserClaps);

export default router;

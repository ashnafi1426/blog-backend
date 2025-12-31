import express from "express";
import signupRouter from "./signupRouter.js";
import loginRouter from "./loginRouter.js";
import postRoutes from "./postRoutes.js";
import commentRoutes from "./commentRoutes.js";
import clapsRoutes from "./clapsRoutes.js";
import usersRoutes from "./usersRoutes.js";
import followRoutes from "./followRoutes.js";
import bookmarkRoutes from "./bookmarkRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import topicRoutes from "./topicRoutes.js";

const router = express.Router();

// Auth routes
router.use('/auth', loginRouter);
router.use('/auth', signupRouter);

// Resource routes
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/claps', clapsRoutes);
router.use('/users', usersRoutes);
router.use('/follow', followRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/notifications', notificationRoutes);
router.use('/topics', topicRoutes);

export default router;

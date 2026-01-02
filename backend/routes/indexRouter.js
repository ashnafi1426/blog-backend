import express from "express";
import signupRouter from "./signupRouter/signupRouter.js";
import loginRouter from "./loginRouter/loginRouter.js";
import postRoutes from "./postRoutes/postRoutes.js";
import commentRoutes from "./commentRoutes/commentRoutes.js";
import clapsRoutes from "./clapsRoutes/clapsRoutes.js";
import usersRoutes from "./usersRoutes/usersRoutes.js";
import followRoutes from "./followRoutes/followRoutes.js";
import bookmarkRoutes from "./bookmarkRoutes/bookmarkRoutes.js";
import notificationRoutes from "./notificationRoutes/notificationRoutes.js";
import topicRoutes from "./topicRoutes/topicRoutes.js";

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

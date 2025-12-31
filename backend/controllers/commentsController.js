import {
  createCommentService,
  getCommentsByPostService,
  updateCommentService,
  deleteCommentService,
  clapCommentService,
} from "../services/commentService.js";

// Create comment
export const createComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.user_id;
    const { content, parent_id } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const newComment = await createCommentService(post_id, userId, content, parent_id);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { page, limit } = req.query;
    
    const comments = await getCommentsByPostService(post_id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const updatedComment = await updateCommentService(id, userId, content);
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found or not yours" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const deletedComment = await deleteCommentService(id, userId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found or not yours" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Clap on a comment
export const clapComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await clapCommentService(id, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

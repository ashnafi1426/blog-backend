import {
  createCommentService,
  getCommentsByPostService,
  updateCommentService,
  deleteCommentService,
  clapCommentService,
  getCommentByIdService,
  getCommentByNumberService,
  getCommentClapsService,
  getUserCommentClapsService,
  getCommentRepliesService,
  getCommentStatsService
} from "../../services/commentService/commentService.js";

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
    const { page, limit, sort } = req.query;
    
    const comments = await getCommentsByPostService(post_id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'newest'
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single comment by ID (supports both UUID and numeric)
export const getComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;
    
    // Check if id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(id);
    const isNumeric = !isNaN(id) && Number.isInteger(Number(id));
    
    let comment = null;
    
    if (isValidUUID) {
      // Try as UUID
      comment = await getCommentByIdService(id, userId);
    } else if (isNumeric) {
      // Try as comment_number
      comment = await getCommentByNumberService(parseInt(id), userId);
    } else {
      return res.status(404).json({ message: "Comment not found - invalid ID format" });
    }
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get replies for a comment
export const getCommentReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    
    const replies = await getCommentRepliesService(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.status(200).json(replies);
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
    const { count = 1 } = req.body;

    const result = await clapCommentService(id, userId, count);
    res.status(200).json({ message: "Comment clapped!", ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comment claps count
export const getCommentClaps = async (req, res) => {
  try {
    const { id } = req.params;
    const claps = await getCommentClapsService(id);
    res.status(200).json({ count: claps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's claps on a comment
export const getUserCommentClaps = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const count = await getUserCommentClapsService(id, userId);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comment statistics
export const getCommentStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await getCommentStatsService(id);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import {
  addBookmarkService,
  removeBookmarkService,
  isBookmarkedService,
  getUserBookmarksService
} from "../services/bookmarkService.js";

// Add bookmark
export const addBookmark = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    await addBookmarkService(userId, postId);
    res.status(200).json({ message: "Bookmarked" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    await removeBookmarkService(userId, postId);
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Check if bookmarked
export const checkBookmark = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    const isBookmarked = await isBookmarkedService(userId, postId);
    res.json({ isBookmarked });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page, limit } = req.query;

    const bookmarks = await getUserBookmarksService(userId, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10 
    });
    res.json(bookmarks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

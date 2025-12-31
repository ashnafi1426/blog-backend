import {
  fetchUserProfile,
  fetchUserByUsername,
  fetchUserPosts,
  updateUserProfile,
  changePassword,
  getUserBookmarks,
  getUserReadingHistory
} from "../services/usersService.js";

// GET /api/users/:id
export const getUserProfileController = async (req, res) => {
  try {
    const user = await fetchUserProfile(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/username/:username
export const getUserByUsernameController = async (req, res) => {
  try {
    const user = await fetchUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id/posts
export const getUserPostsController = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const posts = await fetchUserPosts(req.params.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
export const updateUserProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    console.log("Update profile request:", { id, userId, body: req.body });

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await updateUserProfile(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// PUT /api/users/:id/password
export const changePasswordController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords required" });
    }

    const result = await changePassword(id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/users/:id/bookmarks
export const getUserBookmarksController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    if (id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query;
    const bookmarks = await getUserBookmarks(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id/history
export const getUserHistoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    if (id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query;
    const history = await getUserReadingHistory(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

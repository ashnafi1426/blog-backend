import {
  getNotificationsService,
  getUnreadCountService,
  markAsReadService,
  markAllAsReadService
} from "../services/notificationService.js";

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page, limit, unreadOnly } = req.query;

    const notifications = await getNotificationsService(userId, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === 'true'
    });
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const count = await getUnreadCountService(userId);
    res.json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    await markAsReadService(id, userId);
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await markAllAsReadService(userId);
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

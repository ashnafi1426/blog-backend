import { supabase } from "../config/supabaseClient.js";

// Get user notifications
export const getNotificationsService = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const from = (page - 1) * limit;

  let query = supabase
    .from("notifications")
    .select(`
      *,
      actor:users!notifications_actor_id_fkey(user_id, username, display_name, avatar),
      post:posts(post_id, title)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Get unread count
export const getUnreadCountService = async (userId) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return count || 0;
};

// Mark notification as read
export const markAsReadService = async (notificationId, userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Mark all as read
export const markAllAsReadService = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { message: "All notifications marked as read" };
};

// Create notification
export const createNotificationService = async ({ userId, actorId, type, postId, commentId, message }) => {
  // Don't notify yourself
  if (userId === actorId) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert([{
      user_id: userId,
      actor_id: actorId,
      type,
      post_id: postId,
      comment_id: commentId,
      message
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete old notifications (cleanup)
export const deleteOldNotificationsService = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error } = await supabase
    .from("notifications")
    .delete()
    .lt("created_at", cutoffDate.toISOString())
    .eq("is_read", true);

  if (error) throw new Error(error.message);
  return { message: "Old notifications deleted" };
};

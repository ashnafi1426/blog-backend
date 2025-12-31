import { supabase } from "../config/supabaseClient.js";
import bcrypt from "bcryptjs";

// Fetch user profile by user_id
export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select(`
      user_id,
      username,
      email,
      firstname,
      lastname,
      display_name,
      avatar,
      bio,
      is_premium,
      created_at
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  // Get follower/following counts
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  // Get posts count
  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "published");

  return {
    ...data,
    fullname: `${data.firstname || ''} ${data.lastname || ''}`.trim() || data.username,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    postsCount: postsCount || 0
  };
};

// Fetch user by username
export const fetchUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users")
    .select(`
      user_id,
      username,
      display_name,
      avatar,
      bio,
      is_premium,
      created_at
    `)
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  // Get counts
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", data.user_id);

  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", data.user_id);

  return {
    ...data,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0
  };
};

// Fetch posts by user
export const fetchUserPosts = async (userId, { page = 1, limit = 10, status = 'published' } = {}) => {
  const from = (page - 1) * limit;

  let query = supabase
    .from("posts")
    .select(`
      *,
      post_topics(topic_id, topics(name, slug))
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['username', 'display_name', 'firstname', 'lastname', 'avatar', 'bio'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined && updates[field] !== null) {
      updateData[field] = updates[field];
    }
  }
  
  // If no valid fields to update, return current user
  if (Object.keys(updateData).length === 0) {
    const { data } = await supabase
      .from("users")
      .select()
      .eq("user_id", userId)
      .single();
    return data;
  }
  
  updateData.updated_at = new Date().toISOString();

  console.log("Updating user with data:", updateData);

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message);
  }
  return data;
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Get current user
  const { data: user } = await supabase
    .from("users")
    .select("password")
    .eq("user_id", userId)
    .single();

  if (!user) throw new Error("User not found");

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from("users")
    .update({ password: hashedPassword, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return { message: "Password updated successfully" };
};

// Deactivate account
export const deactivateAccount = async (userId) => {
  const { error } = await supabase
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return { message: "Account deactivated" };
};

// Get user's bookmarks
export const getUserBookmarks = async (userId, { page = 1, limit = 10 } = {}) => {
  const from = (page - 1) * limit;

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      created_at,
      posts(
        *,
        users(user_id, username, display_name, avatar)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data?.map(b => ({ ...b.posts, bookmarked_at: b.created_at })) || [];
};

// Get user's reading history
export const getUserReadingHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const from = (page - 1) * limit;

  const { data, error } = await supabase
    .from("reading_history")
    .select(`
      updated_at,
      read_percentage,
      posts(
        *,
        users(user_id, username, display_name, avatar)
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data?.map(h => ({ ...h.posts, read_at: h.updated_at, read_percentage: h.read_percentage })) || [];
};

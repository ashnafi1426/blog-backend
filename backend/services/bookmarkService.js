import { supabase } from "../config/supabaseClient.js";

// Add bookmark
export const addBookmarkService = async (userId, postId) => {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert([{ user_id: userId, post_id: postId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error("Already bookmarked");
    throw new Error(error.message);
  }
  return data;
};

// Remove bookmark
export const removeBookmarkService = async (userId, postId) => {
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Check if bookmarked
export const isBookmarkedService = async (userId, postId) => {
  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  return !!data;
};

// Get user's bookmarks
export const getUserBookmarksService = async (userId, { page = 1, limit = 10 } = {}) => {
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

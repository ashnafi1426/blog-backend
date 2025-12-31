import { supabase } from "../config/supabaseClient.js";

// Add claps (Medium style - up to 50 per user per post)
export const addClapsService = async (postId, userId, count = 1) => {
  // Get existing claps
  const { data: existing } = await supabase
    .from("claps")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  let newCount;
  
  if (existing) {
    // Update existing claps (max 50)
    newCount = Math.min(existing.count + count, 50);
    const { data, error } = await supabase
      .from("claps")
      .update({ count: newCount, updated_at: new Date().toISOString() })
      .eq("clap_id", existing.clap_id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
  } else {
    // Create new clap record
    newCount = Math.min(count, 50);
    const { error } = await supabase
      .from("claps")
      .insert([{ post_id: postId, user_id: userId, count: newCount }]);
    
    if (error) throw new Error(error.message);
  }

  // Update post claps count
  await updatePostClapsCount(postId);
  
  return { count: newCount };
};

// Remove all claps from a post
export const removeClapsService = async (postId, userId) => {
  const { data, error } = await supabase
    .from("claps")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  
  await updatePostClapsCount(postId);
  return data;
};

// Get total claps for a post
export const getClapsCountService = async (postId) => {
  const { data, error } = await supabase
    .from("claps")
    .select("count")
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  
  const total = data?.reduce((sum, c) => sum + c.count, 0) || 0;
  return total;
};

// Get user's claps on a post
export const getUserClapsService = async (postId, userId) => {
  const { data, error } = await supabase
    .from("claps")
    .select("count")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.count || 0;
};

// Get list of users who clapped
export const getClappersListService = async (postId) => {
  const { data, error } = await supabase
    .from("claps")
    .select(`
      count,
      users(user_id, username, display_name, avatar)
    `)
    .eq("post_id", postId)
    .order("count", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Update post's total claps count
const updatePostClapsCount = async (postId) => {
  const total = await getClapsCountService(postId);
  await supabase
    .from("posts")
    .update({ claps_count: total })
    .eq("post_id", postId);
};

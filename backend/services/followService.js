import { supabase } from "../config/supabaseClient.js";

// Follow a user
export const followUserService = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const { data, error } = await supabase
    .from("followers")
    .insert([{ follower_id: followerId, following_id: followingId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error("Already following this user");
    throw new Error(error.message);
  }

  // Create notification
  await createFollowNotification(followerId, followingId);
  
  return data;
};

// Unfollow a user
export const unfollowUserService = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Check if following
export const isFollowingService = async (followerId, followingId) => {
  const { data } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  return !!data;
};

// Get followers of a user
export const getFollowersService = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from("followers")
    .select(`
      created_at,
      follower:users!followers_follower_id_fkey(user_id, username, display_name, avatar, bio)
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data?.map(f => ({ ...f.follower, followed_at: f.created_at })) || [];
};

// Get users that a user is following
export const getFollowingService = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from("followers")
    .select(`
      created_at,
      following:users!followers_following_id_fkey(user_id, username, display_name, avatar, bio)
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data?.map(f => ({ ...f.following, followed_at: f.created_at })) || [];
};

// Get follower/following counts
export const getFollowCountsService = async (userId) => {
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return {
    followers: followersCount || 0,
    following: followingCount || 0
  };
};

// Follow a topic
export const followTopicService = async (userId, topicId) => {
  const { data, error } = await supabase
    .from("topic_followers")
    .insert([{ user_id: userId, topic_id: topicId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error("Already following this topic");
    throw new Error(error.message);
  }

  // Update topic followers count
  await supabase.rpc('increment_topic_followers', { topic_id: topicId });
  
  return data;
};

// Unfollow a topic
export const unfollowTopicService = async (userId, topicId) => {
  const { data, error } = await supabase
    .from("topic_followers")
    .delete()
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Get user's followed topics
export const getFollowedTopicsService = async (userId) => {
  const { data, error } = await supabase
    .from("topic_followers")
    .select(`
      topics(topic_id, name, slug, description, image_url, followers_count)
    `)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data?.map(t => t.topics) || [];
};

// Create follow notification
const createFollowNotification = async (followerId, followingId) => {
  await supabase.from("notifications").insert([{
    user_id: followingId,
    actor_id: followerId,
    type: 'follow',
    message: 'started following you'
  }]);
};

import { supabase } from "../config/supabaseClient.js";

// Get all topics
export const getAllTopicsService = async () => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("followers_count", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Get topic by slug
export const getTopicBySlugService = async (slug) => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Get posts by topic
export const getPostsByTopicService = async (topicId, { page = 1, limit = 10 } = {}) => {
  const from = (page - 1) * limit;

  const { data, error } = await supabase
    .from("post_topics")
    .select(`
      posts(
        *,
        users(user_id, username, display_name, avatar)
      )
    `)
    .eq("topic_id", topicId)
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data?.map(pt => pt.posts).filter(Boolean) || [];
};

// Get trending topics
export const getTrendingTopicsService = async (limit = 10) => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("posts_count", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
};

// Create topic (admin only)
export const createTopicService = async ({ name, description, imageUrl }) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data, error } = await supabase
    .from("topics")
    .insert([{ name, slug, description, image_url: imageUrl }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Check if user follows topic
export const isFollowingTopicService = async (userId, topicId) => {
  const { data } = await supabase
    .from("topic_followers")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  return !!data;
};

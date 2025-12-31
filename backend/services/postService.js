import { supabase } from "../config/supabaseClient.js";

// Calculate reading time (avg 200 words per minute)
const calculateReadingTime = (content) => {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// Create post (draft by default)
export const createPostDB = async ({ userId, title, subtitle, content, coverImage, topics, status = 'draft' }) => {
  const reading_time = calculateReadingTime(content);
  const postData = {
    user_id: userId,
    title,
    subtitle,
    content,
    cover_image: coverImage,
    reading_time,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null
  };

  const { data, error } = await supabase
    .from("posts")
    .insert([postData])
    .select(`*, users(user_id, username, display_name, avatar)`)
    .single();

  if (error) throw new Error(error.message);

  // Add topics if provided
  if (topics?.length && data) {
    await addTopicsToPost(data.post_id, topics);
  }

  return data;
};

// Get all published posts with author info
export const getAllPostsDB = async ({ page = 1, limit = 10, topic, search } = {}) => {
  let query = supabase
    .from("posts")
    .select(`
      *,
      users(user_id, username, display_name, avatar),
      post_topics(topic_id, topics(name, slug))
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Get personalized feed
export const getFeedDB = async (userId, { page = 1, limit = 10 } = {}) => {
  // Get followed users and topics
  const { data: following } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", userId);

  const { data: followedTopics } = await supabase
    .from("topic_followers")
    .select("topic_id")
    .eq("user_id", userId);

  const followingIds = following?.map(f => f.following_id) || [];
  const topicIds = followedTopics?.map(t => t.topic_id) || [];

  let query = supabase
    .from("posts")
    .select(`
      *,
      users(user_id, username, display_name, avatar),
      post_topics(topic_id, topics(name, slug))
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Filter by followed users or topics
  if (followingIds.length > 0) {
    query = query.in("user_id", followingIds);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Get single post by ID
export const getPostByIdDB = async (id, userId = null) => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users(user_id, username, display_name, avatar, bio),
      post_topics(topic_id, topics(name, slug))
    `)
    .eq("post_id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  
  // Increment view count
  if (data) {
    await supabase.from("posts").update({ views_count: (data.views_count || 0) + 1 }).eq("post_id", id);
    
    // Track reading history if user is logged in
    if (userId) {
      await supabase.from("reading_history").upsert({
        user_id: userId,
        post_id: id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,post_id' });
    }
  }
  
  return data;
};

// Get user's drafts
export const getUserDraftsDB = async (userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Update post
export const updatePostDB = async ({ id, title, subtitle, content, coverImage, status, topics }) => {
  const updateData = { updated_at: new Date().toISOString() };
  
  if (title !== undefined) updateData.title = title;
  if (subtitle !== undefined) updateData.subtitle = subtitle;
  if (content !== undefined) {
    updateData.content = content;
    updateData.reading_time = calculateReadingTime(content);
  }
  if (coverImage !== undefined) updateData.cover_image = coverImage;
  if (status !== undefined) {
    updateData.status = status;
    if (status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("post_id", id)
    .select(`*, users(user_id, username, display_name, avatar)`)
    .maybeSingle();

  if (error) throw new Error(error.message);
  
  // Update topics if provided
  if (topics && data) {
    await supabase.from("post_topics").delete().eq("post_id", id);
    await addTopicsToPost(id, topics);
  }

  return data;
};

// Publish post
export const publishPostDB = async (id, userId) => {
  const { data, error } = await supabase
    .from("posts")
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("post_id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Delete post
export const deletePostDB = async (id) => {
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("post_id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Add topics to post
const addTopicsToPost = async (postId, topicIds) => {
  const records = topicIds.map(topic_id => ({ post_id: postId, topic_id }));
  await supabase.from("post_topics").insert(records);
};

// Search posts
export const searchPostsDB = async (query, { page = 1, limit = 10 } = {}) => {
  const from = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .eq("status", "published")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("claps_count", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data;
};

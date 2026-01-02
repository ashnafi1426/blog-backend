import { supabase } from "../../config/supabaseClient.js";

// Create comment (supports threaded replies)
export const createCommentService = async (postId, userId, content, parentId = null) => {
  if (!userId) throw new Error("User ID is missing");
  if (!postId) throw new Error("Post ID is required");
  if (!content?.trim()) throw new Error("Content is required");

  const { data, error } = await supabase
    .from("comments")
    .insert([{ 
      post_id: postId, 
      user_id: userId, 
      content: content.trim(),
      parent_id: parentId 
    }])
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .single();
  if (error) throw new Error(error.message);
  // Update post comments count
  await updatePostCommentsCount(postId);
  
  // Create notification for post author
  await createCommentNotification(postId, userId, data.comment_id, parentId);

  return data;
};

// Get comments for a post (with nested replies)
export const getCommentsByPostService = async (postId, { page = 1, limit = 20 } = {}) => {
  if (!postId) throw new Error("Post ID is required");

  const from = (page - 1) * limit;

  // Get top-level comments
  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("comment_number", { ascending: true })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const { data: replies } = await supabase
        .from("comments")
        .select(`
          *,
          users(user_id, username, display_name, avatar)
        `)
        .eq("parent_id", comment.comment_id)
        .order("comment_number", { ascending: true });

      return { ...comment, replies: replies || [] };
    })
  );

  return commentsWithReplies;
};

// Update comment
export const updateCommentService = async (commentId, userId, content) => {
  if (!content?.trim()) throw new Error("Content is required");

  const { data, error } = await supabase
    .from("comments")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Delete comment
export const deleteCommentService = async (commentId, userId) => {
  if (!commentId) throw new Error("Comment ID is required");
  if (!userId) throw new Error("User ID is required");

  // Get comment to find post_id
  const { data: comment } = await supabase
    .from("comments")
    .select("post_id")
    .eq("comment_id", commentId)
    .single();

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);

  // Update post comments count
  if (comment?.post_id) {
    await updatePostCommentsCount(comment.post_id);
  }

  return data;
};

// Clap on a comment
export const clapCommentService = async (commentId, userId) => {
  const { data: comment } = await supabase
    .from("comments")
    .select("claps_count")
    .eq("comment_id", commentId)
    .single();

  const { data, error } = await supabase
    .from("comments")
    .update({ claps_count: (comment?.claps_count || 0) + 1 })
    .eq("comment_id", commentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update post's comments count
const updatePostCommentsCount = async (postId) => {
  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  await supabase
    .from("posts")
    .update({ comments_count: count || 0 })
    .eq("post_id", postId);
};

// Get single comment by UUID
export const getCommentByIdService = async (commentId, userId = null) => {
  // Check if id is a valid UUID format BEFORE querying
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(commentId);
  
  if (!isValidUUID) {
    throw new Error("Invalid comment ID format");
  }

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Get single comment by comment_number (numeric ID)
export const getCommentByNumberService = async (commentNumber, userId = null) => {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .eq("comment_number", commentNumber)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// Get comment replies by comment ID
export const getCommentRepliesService = async (commentId, { page = 1, limit = 10 } = {}) => {
  const from = (page - 1) * limit;

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users(user_id, username, display_name, avatar)
    `)
    .eq("parent_id", commentId)
    .order("comment_number", { ascending: true })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return data;
};

// Get comment claps count
export const getCommentClapsService = async (commentId) => {
  const { data, error } = await supabase
    .from("comments")
    .select("claps_count")
    .eq("comment_id", commentId)
    .single();

  if (error) throw new Error(error.message);
  return data?.claps_count || 0;
};

// Get user's claps on a comment
export const getUserCommentClapsService = async (commentId, userId) => {
  // For now, return 0 as we don't have individual user clap tracking for comments
  // This would require a separate comment_claps table similar to post claps
  return 0;
};

// Get comment statistics
export const getCommentStatsService = async (commentId) => {
  const { data: comment, error } = await supabase
    .from("comments")
    .select("claps_count")
    .eq("comment_id", commentId)
    .single();

  if (error) throw new Error(error.message);

  // Count replies
  const { count: repliesCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", commentId);

  return {
    claps_count: comment?.claps_count || 0,
    replies_count: repliesCount || 0
  };
};

// Create comment notification
const createCommentNotification = async (postId, actorId, commentId, parentId) => {
  // Get post author
  const { data: post } = await supabase
    .from("posts")
    .select("user_id, title")
    .eq("post_id", postId)
    .single();

  if (post && post.user_id !== actorId) {
    await supabase.from("notifications").insert([{
      user_id: post.user_id,
      actor_id: actorId,
      type: parentId ? 'reply' : 'comment',
      post_id: postId,
      comment_id: commentId,
      message: parentId ? 'replied to a comment' : 'commented on your post'
    }]);

    // Send email notification for comment
    if (!parentId) {
      try {
        // Email notification removed
      } catch (error) {
        console.error('Error with comment notification:', error);
      }
    }
  }

  // If it's a reply, notify the parent comment author
  if (parentId) {
    const { data: parentComment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("comment_id", parentId)
      .single();

    if (parentComment && parentComment.user_id !== actorId) {
      await supabase.from("notifications").insert([{
        user_id: parentComment.user_id,
        actor_id: actorId,
        type: 'reply',
        post_id: postId,
        comment_id: commentId,
        message: 'replied to your comment'
      }]);

      // Send email notification for reply
      try {
        // Email notification removed
      } catch (error) {
        console.error('Error with reply notification:', error);
      }
    }
  }
};

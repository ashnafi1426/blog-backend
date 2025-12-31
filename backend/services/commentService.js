import { supabase } from "../config/supabaseClient.js";

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
    .order("created_at", { ascending: true })
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
        .order("created_at", { ascending: true });

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

// Create comment notification
const createCommentNotification = async (postId, actorId, commentId, parentId) => {
  // Get post author
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
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
    }
  }
};

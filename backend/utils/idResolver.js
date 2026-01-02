import { supabase } from "../config/supabaseClient.js";

// Helper function to resolve user ID (handles UUID, username, and numeric user_number)
export const resolveUserId = async (identifier) => {
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(identifier);
  const isNumeric = !isNaN(identifier) && Number.isInteger(Number(identifier));
  
  if (isValidUUID) {
    // It's already a UUID, verify it exists
    const { data } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", identifier)
      .single();
    
    if (!data) throw new Error("User not found");
    return identifier;
  } else if (isNumeric) {
    // Treat as user_number and get the user_id
    const { data } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_number", parseInt(identifier))
      .single();
    
    if (!data) throw new Error("User not found");
    return data.user_id;
  } else {
    // Treat as username and get the user_id
    const { data } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", identifier)
      .single();
    
    if (!data) throw new Error("User not found");
    return data.user_id;
  }
};

// Helper function to resolve post ID (handles UUID and numeric post_number)
export const resolvePostId = async (identifier) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(identifier);
  const isNumeric = !isNaN(identifier) && Number.isInteger(Number(identifier));
  
  if (isValidUUID) {
    // Verify UUID exists
    const { data } = await supabase
      .from("posts")
      .select("post_id")
      .eq("post_id", identifier)
      .single();
    
    if (!data) throw new Error("Post not found");
    return identifier;
  } else if (isNumeric) {
    // Convert post_number to post_id
    const { data } = await supabase
      .from("posts")
      .select("post_id")
      .eq("post_number", parseInt(identifier))
      .single();
    
    if (!data) throw new Error("Post not found");
    return data.post_id;
  } else {
    throw new Error("Invalid post ID format");
  }
};

// Helper function to resolve comment ID (handles UUID and numeric comment_number)
export const resolveCommentId = async (identifier) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(identifier);
  const isNumeric = !isNaN(identifier) && Number.isInteger(Number(identifier));
  
  if (isValidUUID) {
    // Verify UUID exists
    const { data } = await supabase
      .from("comments")
      .select("comment_id")
      .eq("comment_id", identifier)
      .single();
    
    if (!data) throw new Error("Comment not found");
    return identifier;
  } else if (isNumeric) {
    // Convert comment_number to comment_id
    const { data } = await supabase
      .from("comments")
      .select("comment_id")
      .eq("comment_number", parseInt(identifier))
      .single();
    
    if (!data) throw new Error("Comment not found");
    return data.comment_id;
  } else {
    throw new Error("Invalid comment ID format");
  }
};

// Helper function to resolve topic ID (handles UUID and slug)
export const resolveTopicId = async (identifier) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(identifier);
  
  if (isValidUUID) {
    // Verify UUID exists
    const { data } = await supabase
      .from("topics")
      .select("topic_id")
      .eq("topic_id", identifier)
      .single();
    
    if (!data) throw new Error("Topic not found");
    return identifier;
  } else {
    // Treat as slug and get the topic_id
    const { data } = await supabase
      .from("topics")
      .select("topic_id")
      .eq("slug", identifier)
      .single();
    
    if (!data) throw new Error("Topic not found");
    return data.topic_id;
  }
};
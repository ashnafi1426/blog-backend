import {
  createPostDB,
  getAllPostsDB,
  getPostByIdDB,
  getUserDraftsDB,
  updatePostDB,
  publishPostDB,
  deletePostDB,
  searchPostsDB,
  getFeedDB
} from "../services/postService.js";

// Create post (draft)
export const createPost = async (req, res) => {
  try {
    console.log("Received body:", JSON.stringify(req.body, null, 2));
    
    const { title, subtitle, content, cover_image, coverImage, topics, status } = req.body;
    const userId = req.user.user_id;

    console.log("Extracted - title:", title, "content length:", content?.length, "status:", status);

    // Strip HTML to check for actual content
    const strippedContent = content?.replace(/<[^>]*>/g, '').trim();
    console.log("Stripped content:", strippedContent);

    // Only validate title/content for published posts, not drafts
    if (status === 'published') {
      if (!title?.trim()) {
        console.log("Validation failed: no title");
        return res.status(400).json({ message: "Title is required to publish" });
      }
      
      if (!strippedContent) {
        console.log("Validation failed: no content");
        return res.status(400).json({ message: "Content is required to publish" });
      }
    }

    const post = await createPostDB({ 
      userId, 
      title, 
      subtitle, 
      content, 
      coverImage: cover_image || coverImage, 
      topics, 
      status 
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all published posts
export const getPosts = async (req, res) => {
  try {
    const { page, limit, topic, search } = req.query;
    const posts = await getAllPostsDB({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10,
      topic,
      search 
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get personalized feed
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page, limit } = req.query;
    const posts = await getFeedDB(userId, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10 
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;
    const post = await getPostByIdDB(id, userId);
    
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's drafts
export const getDrafts = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const drafts = await getUserDraftsDB(userId);
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { title, subtitle, content, cover_image, coverImage, status, topics } = req.body;

    const post = await getPostByIdDB(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id !== userId) return res.status(403).json({ message: "Unauthorized" });

    const updated = await updatePostDB({ 
      id, 
      title, 
      subtitle, 
      content, 
      coverImage: cover_image || coverImage, 
      status, 
      topics 
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Publish post
export const publishPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const post = await getPostByIdDB(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id !== userId) return res.status(403).json({ message: "Unauthorized" });

    const published = await publishPostDB(id, userId);
    res.json(published);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const post = await getPostByIdDB(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user_id !== userId) return res.status(403).json({ message: "Unauthorized" });

    await deletePostDB(id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search posts
export const searchPosts = async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });

    const posts = await searchPostsDB(q, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10 
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

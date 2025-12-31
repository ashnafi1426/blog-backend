import {
  getAllTopicsService,
  getTopicBySlugService,
  getPostsByTopicService,
  getTrendingTopicsService,
  createTopicService,
  isFollowingTopicService
} from "../services/topicService.js";

// Get all topics
export const getAllTopics = async (req, res) => {
  try {
    const topics = await getAllTopicsService();
    res.json(topics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get topic by slug
export const getTopicBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const topic = await getTopicBySlugService(slug);
    
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    
    // Check if user follows this topic
    if (req.user) {
      topic.isFollowing = await isFollowingTopicService(req.user.user_id, topic.topic_id);
    }
    
    res.json(topic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get posts by topic
export const getPostsByTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const posts = await getPostsByTopicService(id, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10 
    });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get trending topics
export const getTrendingTopics = async (req, res) => {
  try {
    const { limit } = req.query;
    const topics = await getTrendingTopicsService(parseInt(limit) || 10);
    res.json(topics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create topic (admin only)
export const createTopic = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    if (!name) return res.status(400).json({ message: "Topic name required" });

    const topic = await createTopicService({ name, description, imageUrl });
    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

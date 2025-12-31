import {
  followUserService,
  unfollowUserService,
  isFollowingService,
  getFollowersService,
  getFollowingService,
  getFollowCountsService,
  followTopicService,
  unfollowTopicService,
  getFollowedTopicsService
} from "../services/followService.js";

// Follow user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.user_id;
    const { id: followingId } = req.params;

    await followUserService(followerId, followingId);
    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.user_id;
    const { id: followingId } = req.params;

    await unfollowUserService(followerId, followingId);
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Check if following
export const checkFollowing = async (req, res) => {
  try {
    const followerId = req.user.user_id;
    const { id: followingId } = req.params;

    const isFollowing = await isFollowingService(followerId, followingId);
    res.json({ isFollowing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const followers = await getFollowersService(id, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20 
    });
    res.json(followers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const following = await getFollowingService(id, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20 
    });
    res.json(following);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get follow counts
export const getFollowCounts = async (req, res) => {
  try {
    const { id } = req.params;
    const counts = await getFollowCountsService(id);
    res.json(counts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Follow topic
export const followTopic = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id: topicId } = req.params;

    await followTopicService(userId, topicId);
    res.status(200).json({ message: "Topic followed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Unfollow topic
export const unfollowTopic = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id: topicId } = req.params;

    await unfollowTopicService(userId, topicId);
    res.json({ message: "Topic unfollowed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get followed topics
export const getFollowedTopics = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const topics = await getFollowedTopicsService(userId);
    res.json(topics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

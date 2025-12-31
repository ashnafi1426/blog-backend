import {
  addClapsService,
  removeClapsService,
  getClapsCountService,
  getUserClapsService,
  getClappersListService
} from "../services/clapsService.js";

// Add claps (Medium style)
export const addClaps = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.user_id;
    const { count = 1 } = req.body;

    const result = await addClapsService(postId, userId, count);
    res.status(200).json({ message: "Clapped!", ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove claps
export const removeClaps = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.user_id;

    await removeClapsService(postId, userId);
    res.json({ message: "Claps removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get claps count
export const getClapsCount = async (req, res) => {
  try {
    const count = await getClapsCountService(req.params.id);
    res.json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's claps on a post
export const getUserClaps = async (req, res) => {
  try {
    const count = await getUserClapsService(req.params.id, req.user.user_id);
    res.json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get clappers list
export const getClappersList = async (req, res) => {
  try {
    const clappers = await getClappersListService(req.params.id);
    res.json(clappers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

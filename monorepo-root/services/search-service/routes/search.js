const express = require("express");
const router = express.Router();
const SearchModel = require("../models/search");
const { searchValidationRules, validate } = require("../middleware/validator");

// Ana arama endpoint'i
router.get("/", searchValidationRules, validate, async (req, res) => {
  try {
    const { query, limit = 10, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Arama sorgusu gereklidir" });
    }

    const results = await SearchModel.search(
      query,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(results);
  } catch (error) {
    console.error("Arama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Sadece kullanıcı araması
router.get("/users", searchValidationRules, validate, async (req, res) => {
  try {
    const { query, limit = 10, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Arama sorgusu gereklidir" });
    }

    const results = await SearchModel.searchUsers(
      query,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(results);
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Sadece topluluk araması
router.get(
  "/communities",
  searchValidationRules,
  validate,
  async (req, res) => {
    try {
      const { query, limit = 10, offset = 0 } = req.query;

      if (!query) {
        return res.status(400).json({ error: "Arama sorgusu gereklidir" });
      }

      const results = await SearchModel.searchCommunities(
        query,
        parseInt(limit),
        parseInt(offset)
      );
      res.json(results);
    } catch (error) {
      console.error("Topluluk arama hatası:", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
);

// Sadece post araması
router.get("/posts", searchValidationRules, validate, async (req, res) => {
  try {
    const { query, limit = 10, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Arama sorgusu gereklidir" });
    }

    const results = await SearchModel.searchPosts(
      query,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(results);
  } catch (error) {
    console.error("Post arama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;

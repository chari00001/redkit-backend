const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

// Post oluşturma
router.post("/", postController.createPost);

// Post güncelleme
router.put("/:id", postController.updatePost);

// Post silme
router.delete("/:id", postController.deletePost);

// Tekil post getirme
router.get("/:id", postController.getPost);

// Post listesi
router.get("/", postController.listPosts);

// Post beğenme
router.post("/:id/like", postController.likePost);

// Post paylaşma
router.post("/:id/share", postController.sharePost);

module.exports = router;

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const postController = require("../controllers/post.controller");
const commentController = require("../controllers/comment.controller");
const validationMiddleware = require("../middleware/validation.middleware.js");

// Test middleware
const testAuth = (req, res, next) => {
  req.user = { id: 3, email: "cagri@gmail.com" };
  next();
};

// Post oluşturma
router.post(
  "/",
  testAuth,
  [
    body("title").trim().notEmpty().withMessage("Başlık gereklidir"),
    body("content").trim().notEmpty().withMessage("İçerik gereklidir"),
    body("media_url").optional().isURL().withMessage("Geçerli bir URL giriniz"),
    body("visibility")
      .isIn(["public", "private", "followers"])
      .withMessage("Geçersiz görünürlük değeri"),
    body("tags").isArray().withMessage("Etiketler dizi olmalıdır"),
    body("allow_comments")
      .isBoolean()
      .withMessage("allow_comments boolean olmalıdır"),
  ],
  validationMiddleware,
  postController.createPost
);

// Post güncelleme
router.put(
  "/:id",
  testAuth,
  [
    body("title").optional().trim().notEmpty().withMessage("Başlık gereklidir"),
    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("İçerik gereklidir"),
    body("media_url").optional().isURL().withMessage("Geçerli bir URL giriniz"),
    body("visibility")
      .optional()
      .isIn(["public", "private", "followers"])
      .withMessage("Geçersiz görünürlük değeri"),
    body("tags").optional().isArray().withMessage("Etiketler dizi olmalıdır"),
    body("allow_comments")
      .optional()
      .isBoolean()
      .withMessage("allow_comments boolean olmalıdır"),
  ],
  validationMiddleware,
  postController.updatePost
);

// Post silme
router.delete("/:id", testAuth, postController.deletePost);

// Tekil post getirme
router.get("/:id", testAuth, postController.getPost);

// Post listesi
router.get("/", postController.listPosts);

// Post beğenme/beğenmeme
router.post("/:id/like", testAuth, postController.toggleLike);

// Post paylaşma
router.post("/:id/share", testAuth, postController.sharePost);

// YORUM ROTALARI

// Post yorumlarını getirme
router.get("/:postId/comments", testAuth, commentController.getPostComments);

// Yorum oluşturma
router.post(
  "/:postId/comments",
  testAuth,
  [
    body("content").trim().notEmpty().withMessage("Yorum içeriği gereklidir"),
    body("parent_id").optional().isInt().withMessage("Geçersiz parent_id"),
    body("anonymous")
      .optional()
      .isBoolean()
      .withMessage("anonymous boolean olmalıdır"),
  ],
  validationMiddleware,
  commentController.createComment
);

// Yorum güncelleme
router.put(
  "/:postId/comments/:commentId",
  testAuth,
  [body("content").trim().notEmpty().withMessage("Yorum içeriği gereklidir")],
  validationMiddleware,
  commentController.updateComment
);

// Yorum silme
router.delete(
  "/:postId/comments/:commentId",
  testAuth,
  commentController.deleteComment
);

// Yorum beğenme/beğenmeme
router.post(
  "/:postId/comments/:commentId/like",
  testAuth,
  commentController.toggleCommentLike
);

module.exports = router;

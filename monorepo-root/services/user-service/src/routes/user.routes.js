const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * Kullanıcılar ile ilgili rotalar
 */

// Kimlik doğrulama gerektirmeyen rotalar
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/verify/:token", userController.verifyAccount);

// Takipçi ve takip edilenler rotaları (ID tabanlı rotalardan ÖNCE tanımlanmalı)
router.get("/followers", authMiddleware, userController.getFollowers);
router.get("/following", authMiddleware, userController.getFollowing);

// Kimlik doğrulama gerektiren rotalar
router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);
router.put("/me/password", authMiddleware, userController.changePassword);
router.put("/me/email", authMiddleware, userController.changeEmail);
router.put(
  "/me/notifications",
  authMiddleware,
  userController.updateNotificationPreferences
);

// Admin rotaları
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);
router.put("/:id/status", authMiddleware, userController.updateUserStatus);

// Kullanıcı takip işlemleri
router.post("/follow/:id", authMiddleware, userController.followUser);
router.delete("/follow/:id", authMiddleware, userController.unfollowUser);

module.exports = router;

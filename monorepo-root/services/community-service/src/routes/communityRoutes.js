const express = require("express");
const router = express.Router();
const { communityController } = require("../controllers");
const {
  authenticate,
  optionalAuthenticate,
} = require("../middleware/authMiddleware");

// Test middleware
const testAuth = (req, res, next) => {
  req.user = { id: 3, email: "cagri@gmail.com", role: "user" };
  next();
};

// İlk önce daha spesifik rotaları tanımla
// Kullanıcının kendi topluluklarını getir
router.get("/user", testAuth, communityController.getUserCommunities);

// Belirli bir kullanıcının topluluklarını getir
router.get("/user/:userId", testAuth, communityController.getUserCommunities);

// Topluluk postlarını getir
router.get(
  "/:id/posts",
  optionalAuthenticate,
  communityController.getCommunityPosts
);

// Sonra genel rotaları tanımla
router.get("/", optionalAuthenticate, communityController.getAllCommunities);
router.get("/:id", optionalAuthenticate, communityController.getCommunityById);
router.get(
  "/:id/members",
  optionalAuthenticate,
  communityController.getCommunityMembers
);

// Kimlik doğrulama gerektiren rotalar
router.post("/", testAuth, communityController.createCommunity);
router.put("/:id", testAuth, communityController.updateCommunity);
router.delete("/:id", testAuth, communityController.deleteCommunity);

// Üyelik rotaları
router.post("/:id/join", testAuth, communityController.joinCommunity);
router.post("/:id/leave", testAuth, communityController.leaveCommunity);
router.put(
  "/:id/members/:userId",
  testAuth,
  communityController.updateMemberRole
);

module.exports = router;

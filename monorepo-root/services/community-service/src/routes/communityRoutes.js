const express = require("express");
const router = express.Router();
const { communityController } = require("../controllers");
const {
  authenticate,
  optionalAuthenticate,
} = require("../middleware/authMiddleware");

// İlk önce daha spesifik rotaları tanımla
router.get(
  "/user/:userId?",
  authenticate,
  communityController.getUserCommunities
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
router.post("/", authenticate, communityController.createCommunity);
router.put("/:id", authenticate, communityController.updateCommunity);
router.delete("/:id", authenticate, communityController.deleteCommunity);

// Üyelik rotaları
router.post("/:id/join", authenticate, communityController.joinCommunity);
router.post("/:id/leave", authenticate, communityController.leaveCommunity);
router.put(
  "/:id/members/:userId",
  authenticate,
  communityController.updateMemberRole
);

module.exports = router;

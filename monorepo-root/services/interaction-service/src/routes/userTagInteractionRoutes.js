const express = require('express');
const router = express.Router();
const userTagInteractionController = require('../controllers/userTagInteractionController');

// Etkileşim kaydetme
router.post('/interactions', userTagInteractionController.recordInteraction);

// Kullanıcının tüm etkileşimlerini getirme
router.get('/users/:userId/interactions', userTagInteractionController.getUserInteractions);

// Kullanıcının belirli bir etiket ile etkileşimlerini getirme
router.get('/users/:userId/tags/:tag', userTagInteractionController.getUserTagInteractions);

// Popüler etiketleri getirme
router.get('/tags/popular', userTagInteractionController.getPopularTags);

module.exports = router;
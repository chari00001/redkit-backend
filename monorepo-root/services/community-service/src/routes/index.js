const express = require("express");
const communityRoutes = require("./communityRoutes");

const router = express.Router();

// Ana API rotaları
router.use("/communities", communityRoutes);

// API durumunu kontrol etmek için basit bir rota
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "Çalışıyor",
    service: "community-service",
    time: new Date().toISOString(),
  });
});

module.exports = router;

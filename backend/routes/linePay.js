const express = require("express");
const router = express.Router();
const { linePayAuth } = require("../services/linePayService");

router.post("/authorize", async (req, res) => {
  try {
    const data = await linePayAuth({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  linePayAuth,
  linePayQueryOrder,
} = require("../services/linePayService");

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

router.post("/query-order", async (req, res) => {
  try {
    const data = await linePayQueryOrder(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

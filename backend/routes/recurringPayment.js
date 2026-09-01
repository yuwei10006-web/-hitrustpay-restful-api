const express = require("express");
const router = express.Router();
const {
  queryRecurringPayment,
  cancelRecurringPayment,
  createRecurringPayment,
} = require("../services/recurringPaymentService");

router.post("/query", async (req, res) => {
  try {
    const data = await queryRecurringPayment(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const data = await cancelRecurringPayment(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const data = await createRecurringPayment({
      ...req.body,
      orderNumber: req.body.orderNumber || "SIP" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

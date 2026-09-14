const express = require("express");
const router = express.Router();
const config = require("../config");
const {
  authorize,
  authorizeSsl,
  authReverse,
  capture,
  captureReverse,
  refund,
  refundReverse,
  queryOrder,
  trxTokenAuthSsl,
  trxTokenAuth,
  mobileAuth,
  mobileAuthDecrypted,
  bindingCardAuth,
} = require("../services/hitrustpayService");
const { saveOrder, getOrder } = require("../services/orderStore");

const TYPE_LABELS = {
  1: "Auth",
  3: "Capture",
  4: "CaptureReverse",
  5: "Refund",
  6: "RefundReverse",
  7: "Query",
  8: "AuthReverse",
};

router.get("/config", (req, res) => {
  res.json({ merid: config.merid, isProd: config.isProd });
});

router.post("/authorize", async (req, res) => {
  try {
    const data = await authorize({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/authorize-ssl", async (req, res) => {
  try {
    const data = await authorizeSsl({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 前端用訂單編號查詢目前已知的交易資訊
router.get("/orders/:orderNumber", (req, res) => {
  const order = getOrder(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, message: "找不到這筆訂單" });
  }
  res.json({ success: true, data: order });
});

router.post("/notify", (req, res) => {
  const {
    orderNumber,
    merid,
    transType,
    retCode,
    authCode,
    authRRN,
    pan,
    trxToken,
    expiry,
  } = req.body;
  if (orderNumber) {
    saveOrder(orderNumber, {
      merid,
      retCode,
      authCode,
      authRRN,
      pan,
      trxToken,
      expiry,
      type: TYPE_LABELS[transType] || transType,
    });
  }
  console.log("收到交易結果通知:", req.body);
  res.json({ code: "0000", message: "ok", success: true });
});

router.get("/return", (req, res) => {
  const { ordernumber, retcode, type } = req.query;
  const qs = new URLSearchParams({ ordernumber, retcode, type }).toString();
  res.redirect(`${config.frontendBaseUrl}/payment-result?${qs}`);
});

router.post("/authorize-reverse", async (req, res) => {
  try {
    const data = await authReverse(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/capture", async (req, res) => {
  try {
    const data = await capture(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/capture-reverse", async (req, res) => {
  try {
    const data = await captureReverse(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const data = await refund(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/refund-reverse", async (req, res) => {
  try {
    const data = await refundReverse(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/query-order", async (req, res) => {
  try {
    const data = await queryOrder(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/authorize-ssl-token", async (req, res) => {
  try {
    const data = await trxTokenAuthSsl({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/authorize-token", async (req, res) => {
  try {
    const data = await trxTokenAuth({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/mobile-auth", async (req, res) => {
  try {
    const data = await mobileAuth({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/binding-card-auth", async (req, res) => {
  try {
    const data = await bindingCardAuth({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/mobile-auth-decrypted", async (req, res) => {
  try {
    const data = await mobileAuthDecrypted({
      ...req.body,
      orderNumber: req.body.orderNumber || "ORD" + Date.now(),
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

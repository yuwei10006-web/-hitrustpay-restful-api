const path = require("path");
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/payment");
const recurringPaymentRoutes = require("./routes/recurringPayment");
const linePayRoutes = require("./routes/linePay");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/payment", paymentRoutes);
app.use("/api/recurring-payment", recurringPaymentRoutes);
app.use("/api/linepay", linePayRoutes);

// 正式環境：一併把前端打包後的靜態檔案 serve 出去，
// 前後端同源部署，不用另外處理跨網域問題。
// 本機開發是分開跑 vite dev(5173) + node index.js(3000)，
// frontend/dist 不存在，這段不會有作用，不影響開發流程。
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

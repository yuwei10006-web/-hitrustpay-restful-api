require("dotenv").config();

function parseApiKeyMap(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("HITRUSTPAY_API_KEYS 格式錯誤，無法解析 JSON，將忽略此設定");
    return {};
  }
}

module.exports = {
  apiKeyBase64: process.env.HITRUSTPAY_API_KEY,
  apiKeysByMerid: parseApiKeyMap(process.env.HITRUSTPAY_API_KEYS),
  merid: process.env.MERID,
  isProd: process.env.NODE_ENV === "production",
  endpoints: {
    test: "https://t-tp-apiservice.hitrustpay.com.tw/tx-service/api",
    prod: "https://tp-apiservice.hitrustpay.com.tw/tx-service/api",
  },
  frontendBaseUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendBaseUrl: process.env.BACKEND_URL || "http://localhost:3000",
};

const crypto = require("crypto");

/**
 * 產生 HiTRUSTpay RESTful API 所需的 Timestamp 與 Signature
 */
function generateAuthHeaders(apiKeyBase64, requestBody) {
  const timestamp = Date.now().toString();
  const apiKey = Buffer.from(apiKeyBase64, "base64");

  // session key = HMAC-SHA256(key = apiKey, message = timestamp)
  const sessionKey = crypto
    .createHmac("sha256", apiKey)
    .update(timestamp)
    .digest();

  const bodyString = JSON.stringify(requestBody);

  // signature = HMAC-SHA256(key = sessionKey, message = bodyString) -> hex
  const signature = crypto
    .createHmac("sha256", sessionKey)
    .update(bodyString, "utf8")
    .digest("hex");

  return { timestamp, signature, bodyString };
}

module.exports = { generateAuthHeaders };

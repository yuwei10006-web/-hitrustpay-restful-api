const config = require("../config");
const { callHitrustpayApi } = require("./hitrustpayService");
const { saveOrder } = require("./orderStore");

// ---------- LINE Pay交易授權(LinePayAuth) ----------

function buildLinePayAuthRequestBody(order, merid) {
  const body = {
    merid,
    orderNumber: order.orderNumber,
    currency: order.currency || "TWD",
    amount: Math.round(order.amount * 100),
    orderDesc: order.orderDesc,
    depositFlag: order.depositFlag ?? "0",
    queryFlag: order.queryFlag ?? "0",
    returnURL: `${config.backendBaseUrl}/api/payment/return`,
    updateURL: `${config.backendBaseUrl}/api/payment/notify`,
  };

  if (order.cancelURL) body.cancelURL = order.cancelURL;

  return body;
}

async function linePayAuth(order) {
  const merid = order.merid || config.merid;
  const body = buildLinePayAuthRequestBody(order, merid);

  // 跟一般授權一樣，先記住原始送出的資料，等使用者從 LINE Pay 導轉回來時可以顯示
  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "Auth",
  });

  return callHitrustpayApi("linepay-auth", merid, body);
}

// ---------- LINE Pay交易查詢(LinePayQueryOrder) ----------

function buildLinePayQueryOrderRequestBody(order, merid) {
  return {
    merid,
    orderNumber: order.orderNumber,
  };
}

async function linePayQueryOrder(order) {
  const merid = order.merid || config.merid;
  const body = buildLinePayQueryOrderRequestBody(order, merid);

  // 純查詢，不更動我們本地暫存訂單狀態
  return callHitrustpayApi("linepay-query-order", merid, body);
}

module.exports = { linePayAuth, linePayQueryOrder };
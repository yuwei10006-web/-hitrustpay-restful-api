const config = require("../config");
const { generateAuthHeaders } = require("../signature");
const { saveOrder } = require("./orderStore");

function resolveApiKey(merid) {
  const key = config.apiKeysByMerid[merid] || config.apiKeyBase64;
  if (!key) {
    throw new Error(`找不到商店代號 ${merid} 對應的 API Key，請確認 .env 設定`);
  }
  return key;
}

async function callHitrustpayApi(action, merid, requestBody) {
  const apiKey = resolveApiKey(merid);
  const { timestamp, signature, bodyString } = generateAuthHeaders(
    apiKey,
    requestBody,
  );
  const url = `${config.isProd ? config.endpoints.prod : config.endpoints.test}/${action}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Timestamp: timestamp,
      Signature: signature,
    },
    body: bodyString,
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(`${action} 呼叫失敗: ${result.code} ${result.message}`);
  }
  return result.data;
}

// ---------- 授權(Authorization) ----------

function buildAuthRequestBody(order, merid) {
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

  if (order.installmentPeriod) body.installmentPeriod = order.installmentPeriod;
  if (order.redeemFlag && order.redeemFlag !== "0")
    body.redeemFlag = order.redeemFlag;

  if (order.creditCard && order.creditCard.pan) {
    body.creditCard = {
      pan: order.creditCard.pan,
      expiry: order.creditCard.expiry,
      ...(order.creditCard.cvv2 ? { cvv2: order.creditCard.cvv2 } : {}),
    };
  }

  if (order.cardholderInfo) {
    const hasValue = Object.entries(order.cardholderInfo).some(
      ([key, val]) => key !== "authenticateOnly" && val,
    );
    if (hasValue) body.cardholderInfo = order.cardholderInfo;
  }

  if (order.subMerchant && order.subMerchant.subMerid) {
    body.subMerchant = order.subMerchant;
  }

  if (order.recurringPaymentSetting && order.recurringPaymentSetting.periods) {
    const setting = { ...order.recurringPaymentSetting };
    const rawSub = setting.subsequentSetting;

    if (rawSub) {
      const cleanedSub = {};
      if (rawSub.phoneNumber) cleanedSub.phoneNumber = rawSub.phoneNumber;
      if (rawSub.recurringStartDate)
        cleanedSub.recurringStartDate = rawSub.recurringStartDate;
      if (rawSub.recurringTransAmount) {
        cleanedSub.recurringTransAmount = Math.round(
          Number(rawSub.recurringTransAmount) * 100,
        );
      }
      // recurringDepositFlag 只有在使用者真的選了 "1"（SALE交易）時才有意義送出，
      // 預設 "0" 本來就是一般交易，不送也沒差，但如果想保留可以判斷是否為 "1"
      if (rawSub.recurringDepositFlag === "1")
        cleanedSub.recurringDepositFlag = "1";

      if (Object.keys(cleanedSub).length > 0) {
        setting.subsequentSetting = cleanedSub;
      } else {
        delete setting.subsequentSetting;
      }
    }

    body.recurringPaymentSetting = setting;
  }

  return body;
}

async function authorize(order) {
  const merid = order.merid || config.merid;
  const body = buildAuthRequestBody(order, merid);

  // 先記住原始送出的資料，等使用者從 HiTRUSTpay 導轉回來時可以顯示
  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "Auth",
  });

  return callHitrustpayApi("auth", merid, body);
}

// ---------- 直接授權(Authorization SSL) ----------

function buildAuthSslRequestBody(order, merid) {
  if (!order.creditCard || !order.creditCard.pan || !order.creditCard.expiry) {
    throw new Error("直接授權需要提供信用卡卡號與到期日");
  }

  const body = {
    merid,
    orderNumber: order.orderNumber,
    currency: order.currency || "TWD",
    amount: Math.round(order.amount * 100),
    orderDesc: order.orderDesc,
    depositFlag: order.depositFlag ?? "0",
    queryFlag: order.queryFlag ?? "0",
    creditCard: {
      pan: order.creditCard.pan,
      expiry: order.creditCard.expiry,
      ...(order.creditCard.cvv2 ? { cvv2: order.creditCard.cvv2 } : {}),
    },
    updateURL: `${config.backendBaseUrl}/api/payment/notify`,
  };

  if (order.installmentPeriod) body.installmentPeriod = order.installmentPeriod;
  if (order.redeemFlag && order.redeemFlag !== "0")
    body.redeemFlag = order.redeemFlag;

  if (order.cardholderInfo) {
    const hasValue = Object.entries(order.cardholderInfo).some(
      ([key, val]) => key !== "authenticateOnly" && val,
    );
    if (hasValue) body.cardholderInfo = order.cardholderInfo;
  }

  if (order.subMerchant && order.subMerchant.subMerid) {
    body.subMerchant = order.subMerchant;
  }

  return body;
}

async function authorizeSsl(order) {
  const merid = order.merid || config.merid;
  const body = buildAuthSslRequestBody(order, merid);

  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "AuthSSL",
  });

  const data = await callHitrustpayApi("authSSL", merid, body);

  // 直接授權是同步拿到結果的，一併存起來
  saveOrder(order.orderNumber, {
    retCode: data.retCode,
    pan: data.creditCardTransactionResult?.pan,
    authCode: data.creditCardTransactionResult?.authCode,
    authRRN: data.creditCardTransactionResult?.authRRN,
  });

  return data;
}

// ---------- 取消授權(AuthReverse) ----------

function buildAuthReverseRequestBody(order, merid) {
  const body = {
    merid,
    orderNumber: order.orderNumber,
    queryFlag: order.queryFlag ?? "0",
  };

  // 未帶 amount 或帶 0，HiTRUSTpay 視為全額取消授權
  if (order.amount) {
    body.amount = Math.round(order.amount * 100);
  }

  return body;
}

async function authReverse(order) {
  const merid = order.merid || config.merid;
  const body = buildAuthReverseRequestBody(order, merid);

  const data = await callHitrustpayApi("auth-reverse", merid, body);

  // 取消授權是對既有訂單操作，更新它目前已知的狀態即可
  saveOrder(order.orderNumber, {
    merid,
    retCode: data.retCode,
    type: "AuthReverse",
  });

  return data;
}

// ---------- 交易請款(Capture) ----------

function buildCaptureRequestBody(order, merid) {
  return {
    merid,
    orderNumber: order.orderNumber,
    amount: Math.round(order.amount * 100),
    queryFlag: order.queryFlag ?? "0",
  };
}

async function capture(order) {
  const merid = order.merid || config.merid;
  const body = buildCaptureRequestBody(order, merid);

  const data = await callHitrustpayApi("capture", merid, body);

  saveOrder(order.orderNumber, {
    merid,
    retCode: data.retCode,
    type: "Capture",
  });

  return data;
}

// ---------- 取消交易請款(CaptureReverse) ----------

function buildCaptureReverseRequestBody(order, merid) {
  return {
    merid,
    orderNumber: order.orderNumber,
    queryFlag: order.queryFlag ?? "0",
  };
}

async function captureReverse(order) {
  const merid = order.merid || config.merid;
  const body = buildCaptureReverseRequestBody(order, merid);

  const data = await callHitrustpayApi("capture-reverse", merid, body);

  saveOrder(order.orderNumber, {
    merid,
    retCode: data.retCode,
    type: "CaptureReverse",
  });

  return data;
}

// ---------- 交易退款(Refund) ----------

function buildRefundRequestBody(order, merid) {
  return {
    merid,
    orderNumber: order.orderNumber,
    amount: Math.round(order.amount * 100),
    queryFlag: order.queryFlag ?? "0",
  };
}

async function refund(order) {
  const merid = order.merid || config.merid;
  const body = buildRefundRequestBody(order, merid);

  const data = await callHitrustpayApi("refund", merid, body);

  saveOrder(order.orderNumber, {
    merid,
    retCode: data.retCode,
    type: "Refund",
  });

  return data;
}

// ---------- 取消交易退款(RefundReverse) ----------

function buildRefundReverseRequestBody(order, merid) {
  return {
    merid,
    orderNumber: order.orderNumber,
    queryFlag: order.queryFlag ?? "0",
  };
}

async function refundReverse(order) {
  const merid = order.merid || config.merid;
  const body = buildRefundReverseRequestBody(order, merid);

  const data = await callHitrustpayApi("refund-reverse", merid, body);

  saveOrder(order.orderNumber, {
    merid,
    retCode: data.retCode,
    type: "RefundReverse",
  });

  return data;
}

// ---------- 信用卡交易查詢(QueryOrder) ----------

function buildQueryOrderRequestBody(order, merid) {
  const body = {
    merid,
    orderNumber: order.orderNumber,
  };
  if (order.showTrxToken) body.showTrxToken = true;
  return body;
}

async function queryOrder(order) {
  const merid = order.merid || config.merid;
  const body = buildQueryOrderRequestBody(order, merid);

  // 純查詢，不更動我們本地暫存訂單狀態的 type
  return callHitrustpayApi("query-order", merid, body);
}

// ---------- 交易序號交易直接授權(TrxTokenAuthSSL) ----------

function buildTrxTokenAuthSslRequestBody(order, merid) {
  if (
    !order.trxTokenInfo ||
    !order.trxTokenInfo.trxToken ||
    !order.trxTokenInfo.expiry
  ) {
    throw new Error("交易序號交易直接授權需要提供交易序號(trxToken)與到期日");
  }

  const body = {
    merid,
    orderNumber: order.orderNumber,
    currency: order.currency || "TWD",
    amount: Math.round(order.amount * 100),
    orderDesc: order.orderDesc,
    depositFlag: order.depositFlag ?? "0",
    queryFlag: order.queryFlag ?? "0",
    trxTokenInfo: {
      trxToken: order.trxTokenInfo.trxToken,
      expiry: order.trxTokenInfo.expiry,
      ...(order.trxTokenInfo.cvv2 ? { cvv2: order.trxTokenInfo.cvv2 } : {}),
    },
    updateURL: `${config.backendBaseUrl}/api/payment/notify`,
  };

  if (order.installmentPeriod) body.installmentPeriod = order.installmentPeriod;
  if (order.redeemFlag && order.redeemFlag !== "0")
    body.redeemFlag = order.redeemFlag;

  if (order.cardholderInfo) {
    const hasValue = Object.entries(order.cardholderInfo).some(
      ([key, val]) => key !== "authenticateOnly" && val,
    );
    if (hasValue) body.cardholderInfo = order.cardholderInfo;
  }

  if (order.subMerchant && order.subMerchant.subMerid) {
    body.subMerchant = order.subMerchant;
  }

  return body;
}

async function trxTokenAuthSsl(order) {
  const merid = order.merid || config.merid;
  const body = buildTrxTokenAuthSslRequestBody(order, merid);

  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "AuthSSL",
  });

  const data = await callHitrustpayApi("trxtoken-authSSL", merid, body);

  saveOrder(order.orderNumber, {
    retCode: data.retCode,
    pan: data.creditCardTransactionResult?.pan,
    authCode: data.creditCardTransactionResult?.authCode,
    authRRN: data.creditCardTransactionResult?.authRRN,
  });

  return data;
}

// ---------- 交易序號交易授權(TrxTokenAuth) ----------

function buildTrxTokenAuthRequestBody(order, merid) {
  if (
    !order.trxTokenInfo ||
    !order.trxTokenInfo.trxToken ||
    !order.trxTokenInfo.expiry
  ) {
    throw new Error("交易序號交易授權需要提供交易序號(trxToken)與到期日");
  }

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
    trxTokenInfo: {
      trxToken: order.trxTokenInfo.trxToken,
      expiry: order.trxTokenInfo.expiry,
      ...(order.trxTokenInfo.cvv2 ? { cvv2: order.trxTokenInfo.cvv2 } : {}),
    },
  };

  if (order.installmentPeriod) body.installmentPeriod = order.installmentPeriod;
  if (order.redeemFlag && order.redeemFlag !== "0")
    body.redeemFlag = order.redeemFlag;

  if (order.cardholderInfo) {
    const hasValue = Object.entries(order.cardholderInfo).some(
      ([key, val]) => key !== "authenticateOnly" && val,
    );
    if (hasValue) body.cardholderInfo = order.cardholderInfo;
  }

  if (order.subMerchant && order.subMerchant.subMerid) {
    body.subMerchant = order.subMerchant;
  }

  return body;
}

async function trxTokenAuth(order) {
  const merid = order.merid || config.merid;
  const body = buildTrxTokenAuthRequestBody(order, merid);

  // 跟 authorize 一樣，先記住原始送出的資料，等使用者從 HiTRUSTpay 導轉回來時可以顯示
  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "Auth",
  });

  return callHitrustpayApi("trxtoken-auth", merid, body);
}

// ---------- 行動支付加密資料交易授權(MobileAuth) ----------

function buildMobileAuthRequestBody(order, merid) {
  if (!order.walletType || !order.mobileWalletPaymentData) {
    throw new Error(
      "行動支付交易授權需要提供 walletType 與 mobileWalletPaymentData",
    );
  }

  const body = {
    merid,
    orderNumber: order.orderNumber,
    currency: order.currency || "TWD",
    amount: Math.round(order.amount * 100),
    orderDesc: order.orderDesc,
    depositFlag: order.depositFlag ?? "0",
    queryFlag: order.queryFlag ?? "0",
    walletType: order.walletType,
    mobileWalletPaymentData: order.mobileWalletPaymentData,
    updateURL: `${config.backendBaseUrl}/api/payment/notify`,
  };

  if (order.encryptedByGW) body.encryptedByGW = order.encryptedByGW;
  if (order.installmentPeriod) body.installmentPeriod = order.installmentPeriod;
  if (order.redeemFlag && order.redeemFlag !== "0")
    body.redeemFlag = order.redeemFlag;

  if (order.subMerchant && order.subMerchant.subMerid) {
    body.subMerchant = order.subMerchant;
  }

  return body;
}

async function mobileAuth(order) {
  const merid = order.merid || config.merid;
  const body = buildMobileAuthRequestBody(order, merid);

  saveOrder(order.orderNumber, {
    merid,
    amount: order.amount,
    orderDesc: order.orderDesc,
    type: "AuthSSL",
  });

  const data = await callHitrustpayApi("mobile-auth", merid, body);

  saveOrder(order.orderNumber, {
    retCode: data.retCode,
    pan: data.creditCardTransactionResult?.pan,
    authCode: data.creditCardTransactionResult?.authCode,
    authRRN: data.creditCardTransactionResult?.authRRN,
  });

  return data;
}

module.exports = {
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
  callHitrustpayApi,
  mobileAuth,
};

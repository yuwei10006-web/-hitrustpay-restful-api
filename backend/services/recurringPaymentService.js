const config = require("../config");
const { callHitrustpayApi } = require("./hitrustpayService");

// ---------- 定期定額訂單查詢(QueryRecurringPayment) ----------

async function queryRecurringPayment(order) {
  const merid = order.merid || config.merid;
  const body = {
    merid,
    orderNumber: order.orderNumber, // 首期訂單號碼
  };
  return callHitrustpayApi("query-recurring-payment", merid, body);
}

// ---------- 取消定期定額訂單(CancelRecurringPayment) ----------

async function cancelRecurringPayment(order) {
  const merid = order.merid || config.merid;
  const body = {
    merid,
    orderNumber: order.orderNumber, // 首期訂單號碼
  };
  return callHitrustpayApi("cancel-recurring-payment", merid, body);
}

// ---------- 建立定期定額訂單(CreateRecurringPayment) ----------

function buildCreateRecurringPaymentRequestBody(order, merid) {
  if (
    !order.initialOrderNumber ||
    !order.initialOrderAuthCode ||
    !order.initialOrderMerid
  ) {
    throw new Error(
      "建立定期定額訂單需要提供已授權訂單的商店代號、訂單編號與授權碼",
    );
  }
  if (
    !order.recurringPaymentSetting ||
    !order.recurringPaymentSetting.periods ||
    !order.recurringPaymentSetting.cycle ||
    !order.recurringPaymentSetting.cycleType
  ) {
    throw new Error("請填寫完整的定期定額設定（扣款期數、週期、週期種類）");
  }

  const setting = { ...order.recurringPaymentSetting };
  const sub = setting.subsequentSetting;
  const hasSubValue = sub && Object.values(sub).some((v) => v);
  if (!hasSubValue) delete setting.subsequentSetting;

  return {
    merid,
    orderNumber: order.orderNumber,
    initialOrderMerid: order.initialOrderMerid,
    initialOrderNumber: order.initialOrderNumber,
    initialOrderAuthCode: order.initialOrderAuthCode,
    recurringPaymentSetting: setting,
  };
}

async function createRecurringPayment(order) {
  const merid = order.merid || config.merid;
  const body = buildCreateRecurringPaymentRequestBody(order, merid);
  return callHitrustpayApi(
    "create-recurring-payment-include-initial-order",
    merid,
    body,
  );
}

module.exports = {
  queryRecurringPayment,
  cancelRecurringPayment,
  createRecurringPayment,
};

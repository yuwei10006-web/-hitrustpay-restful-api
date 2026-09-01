// 簡易記憶體暫存（後端重啟會清空）：記錄每筆訂單目前已知的資訊，
// 讓使用者從 HiTRUSTpay 導轉回 /payment-result 時，
// 還能顯示原本送出的商店代號、金額等資料。
// 正式上線建議改成資料庫，避免重啟或多台伺服器造成資料遺失。
const orders = new Map();

function saveOrder(orderNumber, data) {
  orders.set(orderNumber, { ...(orders.get(orderNumber) || {}), ...data });
}

function getOrder(orderNumber) {
  return orders.get(orderNumber) || null;
}

module.exports = { saveOrder, getOrder };

import { BACKEND_URL } from "./paymentApi";

export async function startLinePayAuthorization(payload) {
  const res = await fetch(`${BACKEND_URL}/api/linepay/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function queryLinePayOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/api/linepay/query-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

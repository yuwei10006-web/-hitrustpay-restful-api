import { BACKEND_URL } from "./paymentApi";

export async function queryRecurringPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/recurring-payment/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function cancelRecurringPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/recurring-payment/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function createRecurringPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/recurring-payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

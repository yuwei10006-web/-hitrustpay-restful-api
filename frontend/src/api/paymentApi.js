export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export async function getMerchantConfig() {
  const res = await fetch(`${BACKEND_URL}/api/payment/config`);
  return res.json();
}

export async function startAuthorization(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function startAuthorizationSsl(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/authorize-ssl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getOrder(orderNumber) {
  const res = await fetch(`${BACKEND_URL}/api/payment/orders/${orderNumber}`);
  return res.json();
}

export async function cancelAuthorization(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/authorize-reverse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function capturePayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function captureReversePayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/capture-reverse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function refundPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function refundReversePayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/refund-reverse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function queryOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/query-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function startAuthorizationSslToken(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/authorize-ssl-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function startAuthorizationToken(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/authorize-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function startMobileAuth(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payment/mobile-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

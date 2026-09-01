import { useEffect, useState } from "react";
import { getMerchantConfig } from "../api/paymentApi";

const emptyCardholderInfo = {
  idNumber: "",
  cellPhoneNumber: "",
  birthYear: "",
  birthDate: "",
  homePhoneNumber: "",
  officePhoneNumber: "",
  authenticateOnly: "N",
};

export function useOrderForm({ defaultOrderDesc = "API 串接測試" } = {}) {
  const [merid, setMerid] = useState("");
  const [orderNumber, setOrderNumber] = useState(() => "ORD" + Date.now());
  const [currency, setCurrency] = useState("TWD");
  const [amount, setAmount] = useState("100");
  const [orderDesc, setOrderDesc] = useState(defaultOrderDesc);
  const [depositFlag, setDepositFlag] = useState("0");
  const [queryFlag, setQueryFlag] = useState("0");
  const [installmentPeriod, setInstallmentPeriod] = useState("");
  const [redeemFlag, setRedeemFlag] = useState("0");
  const [creditCard, setCreditCard] = useState({
    pan: "",
    expiry: "",
    cvv2: "",
  });
  const [cardholderInfo, setCardholderInfo] = useState(emptyCardholderInfo);
  const [subMerchant, setSubMerchant] = useState({
    subMerid: "",
    subMcc: "",
    subMerName: "",
  });

  useEffect(() => {
    getMerchantConfig()
      .then((c) => setMerid(c.merid))
      .catch(() => {});
  }, []);

  const regenerateOrderNumber = () => setOrderNumber("ORD" + Date.now());

  const validateBase = () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return "請輸入有效的交易金額";
    if (!orderDesc.trim()) return "請輸入訂單說明";
    if (installmentPeriod && redeemFlag === "1")
      return "分期期數與使用紅利無法同時使用";
    return null;
  };

  const buildBasePayload = () => {
    const payload = {
      merid,
      orderNumber,
      currency,
      amount: Number(amount),
      orderDesc,
      depositFlag,
      queryFlag,
    };
    if (installmentPeriod) payload.installmentPeriod = installmentPeriod;
    if (redeemFlag === "1") payload.redeemFlag = redeemFlag;
    if (creditCard.pan) payload.creditCard = creditCard;
    if (
      Object.entries(cardholderInfo).some(
        ([k, v]) => k !== "authenticateOnly" && v,
      )
    ) {
      payload.cardholderInfo = cardholderInfo;
    }
    if (subMerchant.subMerid) payload.subMerchant = subMerchant;
    return payload;
  };

  return {
    merid,
    setMerid,
    orderNumber,
    regenerateOrderNumber,
    currency,
    setCurrency,
    amount,
    setAmount,
    orderDesc,
    setOrderDesc,
    depositFlag,
    setDepositFlag,
    queryFlag,
    setQueryFlag,
    installmentPeriod,
    setInstallmentPeriod,
    redeemFlag,
    setRedeemFlag,
    creditCard,
    setCreditCard,
    cardholderInfo,
    setCardholderInfo,
    subMerchant,
    setSubMerchant,
    validateBase,
    buildBasePayload,
  };
}

import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startMobileAuth } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function ApplePayPage() {
  const form = useOrderForm({ defaultOrderDesc: 'Apple Pay測試' });
  const [mobileWalletPaymentData, setMobileWalletPaymentData] = useState('');
  const [encryptedByGW, setEncryptedByGW] = useState('Y');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);
    if (!mobileWalletPaymentData.trim()) {
      return setError('請貼上 Apple Pay 回傳的加密資料(paymentData)');
    }

    setLoading(true);
    try {
      const payload = {
        ...form.buildBasePayload(),
        walletType: '1', // 1 = Apple Pay
        mobileWalletPaymentData,
        encryptedByGW,
      };
      delete payload.creditCard;

      const response = await startMobileAuth(payload);
      if (!response.success) {
        setError(response.message || '交易發起失敗，請稍後再試');
        return;
      }
      setSubmittedOrderNumber(form.orderNumber);
      setResult(response.data);
    } catch (err) {
      setError('無法連線到付款服務，請稍後再試');
    } finally {
      setLoading(false);
      form.regenerateOrderNumber();
    }
  };

  const isSuccess = result?.retCode === '00';
  const cc = result?.creditCardTransactionResult;

  return (
    <AppLayout title="Apple Pay" subtitle="將 Apple Pay 回傳的加密資料送往 HiTRUSTpay 完成交易授權">
      <form className="checkout-card checkout-card--wide" onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="section">
          <h2 className="section-title">基本資訊</h2>
          <div className="grid-2">
            <div className="field">
              <label>商店代號</label>
              <input value={form.merid} onChange={(e) => form.setMerid(e.target.value)} />
            </div>
            <div className="field">
              <label>訂單編號</label>
              <input value={form.orderNumber} disabled />
            </div>
            <div className="field">
              <label>幣別</label>
              <input value={form.currency} onChange={(e) => form.setCurrency(e.target.value)} />
            </div>
            <div className="field">
              <label>交易金額</label>
              <input type="number" min="1" value={form.amount} onChange={(e) => form.setAmount(e.target.value)} className="amount-input" />
            </div>
            <div className="field field-full">
              <label>訂單說明</label>
              <input maxLength={20} value={form.orderDesc} onChange={(e) => form.setOrderDesc(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">交易設定</h2>
          <div className="grid-2">
            <div className="field">
              <label>交易類別</label>
              <select value={form.depositFlag} onChange={(e) => form.setDepositFlag(e.target.value)}>
                <option value="0">一般交易（僅授權）</option>
                <option value="1">Sale 交易（自動請款）</option>
              </select>
            </div>
            <div className="field">
              <label>即時交易明細查詢</label>
              <select value={form.queryFlag} onChange={(e) => form.setQueryFlag(e.target.value)}>
                <option value="0">不要</option>
                <option value="1">要</option>
              </select>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Apple Pay 加密資料</h2>
          <div className="field field-full">
            <label>加密資料(mobileWalletPaymentData) *</label>
            <textarea
              rows={6}
              value={mobileWalletPaymentData}
              onChange={(e) => setMobileWalletPaymentData(e.target.value)}
              placeholder='貼上 Apple Pay 回傳的 payment.token.paymentData（JSON字串）'
              className="checkout-textarea"
            />
          </div>
          <div className="field">
            <label>是否使用 HiTRUST 憑證加密</label>
            <select value={encryptedByGW} onChange={(e) => setEncryptedByGW(e.target.value)}>
              <option value="Y">是（預設，店家使用 HiTRUST 憑證）</option>
              <option value="N">否</option>
            </select>
          </div>
          <p className="field-hint">
            這份加密資料由前端 Apple Pay JS（ApplePaySession）在持卡人完成 Face ID/Touch ID 授權後回傳，
            實際上線前端要串接 Apple Pay Merchant ID 與憑證後才能真的產生這段資料，此頁面先讓你貼入測試資料驗證後端串接邏輯。
          </p>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '送出 Apple Pay 授權'}
        </button>

        {result && (
          <TransactionResultCard
            success={isSuccess}
            retCode={result.retCode}
            rows={[
              { label: '商店代號', key: 'merid', value: result.merid },
              { label: '訂單編號', key: 'ordernumber', value: submittedOrderNumber },
              { label: '訂單金額', key: 'amount', value: form.amount },
              { label: '卡號', key: 'cardnumber', value: cc?.pan },
              { label: '銀行授權碼', key: 'authcode', value: cc?.authCode },
            ]}
          />
        )}
      </form>
    </AppLayout>
  );
}
import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startMobileAuthDecrypted } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import './Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function ApplePayDecryptedPage() {
  const form = useOrderForm({ defaultOrderDesc: 'Apple Pay(已解密)測試' });
  const [tavv, setTavv] = useState('');
  const [eci, setEci] = useState('');
  const [extensionField, setExtensionField] = useState('');
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
    if (!form.creditCard.pan || !form.creditCard.expiry) {
      return setError('請輸入解密後取得的卡號與到期日');
    }

    setLoading(true);
    try {
      const payload = {
        ...form.buildBasePayload(),
        walletType: '1', // 1 = Apple Pay
      };
      if (tavv) payload.tavv = tavv;
      if (eci) payload.eci = eci;
      if (extensionField) payload.extensionField = extensionField;

      const response = await startMobileAuthDecrypted(payload);
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
    <AppLayout title="Apple Pay 已解密資料交易授權" subtitle="商家自行解密 Apple Pay 加密資料後，直接帶卡號、效期、TAVV/ECI 完成交易授權">
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
            <div className="field">
              <label>分期期數</label>
              <input value={form.installmentPeriod} onChange={(e) => form.setInstallmentPeriod(e.target.value)} placeholder="不分期請留空" />
            </div>
            <div className="field">
              <label>使用紅利</label>
              <select value={form.redeemFlag} onChange={(e) => form.setRedeemFlag(e.target.value)}>
                <option value="0">不使用</option>
                <option value="1">使用</option>
              </select>
            </div>
          </div>
          <p className="field-hint">分期與紅利無法同時使用</p>
        </div>

        <div className="section">
          <h2 className="section-title">解密後卡片資訊</h2>
          <div className="grid-2">
            <div className="field">
              <label>卡號(pan) *</label>
              <input value={form.creditCard.pan} onChange={(e) => form.setCreditCard({ ...form.creditCard, pan: e.target.value })} placeholder="解密 payment token 後取得的卡號" />
            </div>
            <div className="field">
              <label>到期日（YYMM） *</label>
              <input value={form.creditCard.expiry} onChange={(e) => form.setCreditCard({ ...form.creditCard, expiry: e.target.value })} />
            </div>
            <div className="field">
              <label>CVV2</label>
              <input value={form.creditCard.cvv2} onChange={(e) => form.setCreditCard({ ...form.creditCard, cvv2: e.target.value })} />
            </div>
          </div>
          <p className="field-hint">此為商家自行將 Apple Pay 回傳的加密資料解密後取得的卡片資訊，需自行負責解密流程與 PCI DSS 規範</p>
        </div>

        <div className="section">
          <h2 className="section-title">Apple Pay 驗證資料</h2>
          <div className="grid-2">
            <div className="field">
              <label>TAVV</label>
              <input value={tavv} onChange={(e) => setTavv(e.target.value)} placeholder="解密後取得的 TAVV 值" />
            </div>
            <div className="field">
              <label>ECI</label>
              <input value={eci} onChange={(e) => setEci(e.target.value)} placeholder="解密後取得的 ECI 值" />
            </div>
          </div>
        </div>

        <details className="advanced-section">
          <summary>次特店資訊（選填）</summary>
          <div className="grid-2">
            <div className="field">
              <label>次特店代號</label>
              <input value={form.subMerchant.subMerid} onChange={(e) => form.setSubMerchant({ ...form.subMerchant, subMerid: e.target.value })} />
            </div>
            <div className="field">
              <label>次特店 MCC</label>
              <input value={form.subMerchant.subMcc} onChange={(e) => form.setSubMerchant({ ...form.subMerchant, subMcc: e.target.value })} />
            </div>
            <div className="field field-full">
              <label>次特店名稱</label>
              <input value={form.subMerchant.subMerName} onChange={(e) => form.setSubMerchant({ ...form.subMerchant, subMerName: e.target.value })} />
            </div>
          </div>
        </details>

        <details className="advanced-section">
          <summary>延伸欄位（選填）</summary>
          <div className="field field-full">
            <label>extensionField</label>
            <input value={extensionField} onChange={(e) => setExtensionField(e.target.value)} />
          </div>
        </details>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '送出 Apple Pay 已解密資料授權'}
        </button>

        {result && (
          <TransactionResultCard
            success={isSuccess}
            retCode={result.retCode}
            rows={[
              { label: '商店代號', key: 'merid', value: result.merid },
              { label: '訂單編號', key: 'ordernumber', value: submittedOrderNumber },
              { label: '訂單金額', key: 'amount', value: form.amount },
              { label: '交易類別', key: 'type', value: 'AuthSSL' },
              { label: '卡號', key: 'cardnumber', value: cc?.pan },
              { label: '銀行授權碼', key: 'authcode', value: cc?.authCode },
              { label: '銀行調單編號', key: 'authrrn', value: cc?.authRRN },
            ]}
            note={
              isSuccess && !cc?.pan
                ? '若卡號未顯示，需先向 HiTRUSTpay 申請開啟遮罩卡號回傳功能，或將「即時交易明細查詢」設為要'
                : null
            }
          />
        )}
      </form>
    </AppLayout>
  );
}
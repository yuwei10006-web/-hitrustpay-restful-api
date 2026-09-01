import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startAuthorizationToken } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';

export default function AuthorizationTokenPage() {
  const form = useOrderForm({ defaultOrderDesc: '交易序號授權測試' });
  const [trxTokenInfo, setTrxTokenInfo] = useState({ trxToken: '', expiry: '', cvv2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);
    if (!trxTokenInfo.trxToken || !trxTokenInfo.expiry) {
      return setError('請輸入交易序號(trxToken)與到期日');
    }

    setLoading(true);
    try {
      const payload = { ...form.buildBasePayload(), trxTokenInfo };
      delete payload.creditCard;

      const result = await startAuthorizationToken(payload);
      if (!result.success) {
        setError(result.message || '交易發起失敗，請稍後再試');
        return;
      }
      window.location.href = result.data.token;
    } catch (err) {
      setError('無法連線到付款服務，請稍後再試');
    } finally {
      setLoading(false);
      form.regenerateOrderNumber();
    }
  };

  return (
    <AppLayout title="3D授權含交易序號(Token)" subtitle="用交易序號跳轉至 HiTRUSTpay 進行 3DS 驗證後完成授權">
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
          <h2 className="section-title">交易序號資訊</h2>
          <div className="grid-2">
            <div className="field">
              <label>交易序號(trxToken) *</label>
              <input value={trxTokenInfo.trxToken} onChange={(e) => setTrxTokenInfo({ ...trxTokenInfo, trxToken: e.target.value })} />
            </div>
            <div className="field">
              <label>到期日（YYMM） *</label>
              <input value={trxTokenInfo.expiry} onChange={(e) => setTrxTokenInfo({ ...trxTokenInfo, expiry: e.target.value })} />
            </div>
            <div className="field">
              <label>CVV2</label>
              <input value={trxTokenInfo.cvv2} onChange={(e) => setTrxTokenInfo({ ...trxTokenInfo, cvv2: e.target.value })} />
            </div>
          </div>
          <p className="field-hint">交易序號需先透過「信用卡綁卡交易授權」取得</p>
        </div>

        <details className="advanced-section">
          <summary>身分認證資訊（選填）</summary>
          <div className="grid-2">
            <div className="field">
              <label>身分證字號</label>
              <input value={form.cardholderInfo.idNumber} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, idNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>行動電話號碼</label>
              <input value={form.cardholderInfo.cellPhoneNumber} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, cellPhoneNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>出生年（西元）</label>
              <input value={form.cardholderInfo.birthYear} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, birthYear: e.target.value })} />
            </div>
            <div className="field">
              <label>出生日（MMdd）</label>
              <input value={form.cardholderInfo.birthDate} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, birthDate: e.target.value })} />
            </div>
            <div className="field">
              <label>居家電話</label>
              <input value={form.cardholderInfo.homePhoneNumber} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, homePhoneNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>公司電話</label>
              <input value={form.cardholderInfo.officePhoneNumber} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, officePhoneNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>是否為純身分認證</label>
              <select value={form.cardholderInfo.authenticateOnly} onChange={(e) => form.setCardholderInfo({ ...form.cardholderInfo, authenticateOnly: e.target.value })}>
                <option value="N">否</option>
                <option value="Y">是</option>
              </select>
            </div>
          </div>
        </details>

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

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '發起授權交易'}
        </button>
      </form>
    </AppLayout>
  );
}
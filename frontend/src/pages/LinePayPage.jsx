import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startLinePayAuthorization } from '../api/linePayApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';

export default function LinePayPage() {
  const form = useOrderForm({ defaultOrderDesc: 'LINE Pay測試' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const result = await startLinePayAuthorization(form.buildBasePayload());
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
    <AppLayout title="LINE Pay" subtitle="跳轉至 LINE Pay 完成付款，手機會開啟 App，電腦會顯示掃碼頁面">
      <form className="checkout-card" onSubmit={handleSubmit}>
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

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '使用 LINE Pay 付款'}
        </button>
      </form>
    </AppLayout>
  );
}
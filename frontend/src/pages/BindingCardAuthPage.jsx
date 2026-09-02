import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startBindingCardAuth } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';

export default function BindingCardAuthPage() {
  const form = useOrderForm({ defaultOrderDesc: '信用卡綁卡測試' });
  const [bindingWithVerify, setBindingWithVerify] = useState('0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const payload = { ...form.buildBasePayload(), bindingWithVerify };

      const result = await startBindingCardAuth(payload);
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
    <AppLayout title="信用卡綁卡" subtitle="授權成功後會取得交易序號(trxToken)，之後可用於「直接授權含Token」等頁面測試">
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
          <h2 className="section-title">綁卡設定</h2>
          <div className="grid-2">
            <div className="field">
              <label>交易類別</label>
              <select value={form.depositFlag} onChange={(e) => form.setDepositFlag(e.target.value)}>
                <option value="0">一般交易（僅授權）</option>
                <option value="1">Sale 交易（自動請款）</option>
              </select>
            </div>
            <div className="field">
              <label>是否一併手機門號驗證 *</label>
              <select value={bindingWithVerify} onChange={(e) => setBindingWithVerify(e.target.value)}>
                <option value="0">否</option>
                <option value="1">是</option>
              </select>
            </div>
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '發起綁卡授權'}
        </button>
      </form>
    </AppLayout>
  );
}
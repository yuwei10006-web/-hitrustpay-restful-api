import { useEffect, useState } from 'react';
import { getMerchantConfig } from '../api/paymentApi';
import { cancelRecurringPayment } from '../api/recurringPaymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function SipCancelPage() {
  const [merid, setMerid] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getMerchantConfig().then((c) => setMerid(c.merid)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!orderNumber.trim()) {
      return setError('請輸入首期訂單編號');
    }

    setLoading(true);
    try {
      const response = await cancelRecurringPayment({ merid, orderNumber });
      if (!response.success) {
        setError(response.message || '取消失敗，請稍後再試');
        return;
      }
      setResult(response.data);
    } catch (err) {
      setError('無法連線到付款服務，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = result?.retCode === '00';

  return (
    <AppLayout title="定期定額取消" subtitle="終止定期定額訂單，停止後續扣款">
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
              <input value={merid} onChange={(e) => setMerid(e.target.value)} />
            </div>
            <div className="field">
              <label>首期訂單編號 *</label>
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="要終止的定期定額首期訂單號" />
            </div>
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '取消定期定額'}
        </button>

        {result && (
          <TransactionResultCard
            success={isSuccess}
            retCode={result.retCode}
            rows={[
              { label: '商店代號', key: 'merid', value: result.merid },
              { label: '訂單編號', key: 'ordernumber', value: orderNumber },
            ]}
          />
        )}
      </form>
    </AppLayout>
  );
}
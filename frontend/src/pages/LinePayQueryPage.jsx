import { useEffect, useState } from 'react';
import { getMerchantConfig } from '../api/paymentApi';
import { queryLinePayOrder } from '../api/linePayApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function LinePayQueryPage() {
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
      return setError('請輸入要查詢的訂單編號');
    }

    setLoading(true);
    try {
      const response = await queryLinePayOrder({ merid, orderNumber });
      if (!response.success) {
        setError(response.message || '查詢失敗，請稍後再試');
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
  const pq = result?.paymentQueryResult;

  return (
    <AppLayout title="LINE Pay交易查詢" subtitle="查詢 LINE Pay 訂單目前在 HiTRUSTpay 那邊的即時狀態">
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
              <label>訂單編號 *</label>
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="要查詢的訂單號" />
            </div>
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '查詢中' : '查詢訂單'}
        </button>

        {result && (
          <TransactionResultCard
            success={isSuccess}
            retCode={result.retCode}
            rows={[
              { label: '商店代號', key: 'merid', value: result.merid },
              { label: '訂單編號', key: 'ordernumber', value: pq?.orderNumber },
              { label: '訂單狀態', key: 'orderstatus', value: pq?.orderStatus },
              { label: '訂單日期', key: 'orderdate', value: pq?.orderDate },
              { label: '核准金額', key: 'approveamount', value: pq?.approveAmount },
              { label: '請款金額', key: 'captureamount', value: pq?.captureAmount },
              { label: '請款日期', key: 'capturedate', value: pq?.captureDate },
              { label: '退款金額', key: 'refundamount', value: pq?.refundAmount },
              { label: '退款日期', key: 'refunddate', value: pq?.refundDate },
            ]}
          />
        )}
      </form>
    </AppLayout>
  );
}
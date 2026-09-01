import { useEffect, useState } from 'react';
import { getMerchantConfig, queryOrder } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function QueryOrderPage() {
  const [merid, setMerid] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [showTrxToken, setShowTrxToken] = useState(false);
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
      const response = await queryOrder({ merid, orderNumber, showTrxToken });
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
  const cc = result?.creditCardTransactionResult;

  return (
    <AppLayout title="訂單查詢" subtitle="查詢訂單目前在 HiTRUSTpay 那邊的即時狀態">
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
            <div className="field">
              <label>回傳交易序號</label>
              <select value={showTrxToken ? '1' : '0'} onChange={(e) => setShowTrxToken(e.target.value === '1')}>
                <option value="0">不要</option>
                <option value="1">要</option>
              </select>
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
              { label: '退款金額', key: 'refundamount', value: pq?.refundAmount },
              { label: '銀行授權碼', key: 'authcode', value: cc?.authCode },
              { label: '銀行調單編號', key: 'authrrn', value: cc?.authRRN },
              { label: '交易序號', key: 'trxtoken', value: result.trxToken },
              { label: '風險偵測狀態', key: 'riskdetectcode', value: result.riskDetectCode },
              { label: '風險審核狀態', key: 'riskactionstatus', value: result.riskActionStatus },
            ]}
          />
        )}
      </form>
    </AppLayout>
  );
}
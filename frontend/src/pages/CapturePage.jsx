import { useEffect, useState } from 'react';
import { getMerchantConfig, capturePayment } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function CapturePage() {
  const [merid, setMerid] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [queryFlag, setQueryFlag] = useState('0');
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
      return setError('請輸入要請款的訂單編號');
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return setError('請輸入有效的請款金額');
    }

    setLoading(true);
    try {
      const response = await capturePayment({
        merid,
        orderNumber,
        amount: numericAmount,
        queryFlag,
      });
      if (!response.success) {
        setError(response.message || '請款失敗，請稍後再試');
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
    <AppLayout title="交易請款" subtitle="對已授權的訂單執行請款">
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
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="要請款的原始訂單號" />
            </div>
            <div className="field">
              <label>請款金額 *</label>
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="amount-input" />
            </div>
            <div className="field">
              <label>即時交易明細查詢</label>
              <select value={queryFlag} onChange={(e) => setQueryFlag(e.target.value)}>
                <option value="0">不要</option>
                <option value="1">要</option>
              </select>
            </div>
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '執行請款'}
        </button>

        {result && (
          <TransactionResultCard
            success={isSuccess}
            retCode={result.retCode}
            rows={[
              { label: '商店代號', key: 'merid', value: result.merid },
              { label: '訂單編號', key: 'ordernumber', value: orderNumber },
              { label: '訂單狀態', key: 'orderstatus', value: pq?.orderStatus },
              { label: '請款金額', key: 'captureamount', value: pq?.captureAmount },
              { label: '請款批次號碼', key: 'paybatchnum', value: cc?.payBatchNum },
              { label: '銀行授權碼', key: 'authcode', value: cc?.authCode },
              { label: '銀行調單編號', key: 'authrrn', value: cc?.authRRN },
            ]}
            note={queryFlag !== '1' ? '若要看到訂單狀態、請款金額等明細，請把「即時交易明細查詢」設為要' : null}
          />
        )}
      </form>
    </AppLayout>
  );
}
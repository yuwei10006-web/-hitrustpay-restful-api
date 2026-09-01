import { useEffect, useState } from 'react';
import { getMerchantConfig } from '../api/paymentApi';
import { queryRecurringPayment } from '../api/recurringPaymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';
import TransactionResultCard from '../components/TransactionResultCard';

export default function SipQueryPage() {
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
      const response = await queryRecurringPayment({ merid, orderNumber });
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
  const info = result?.recurringPaymentData?.recurringPaymentInfo;
  const details = result?.recurringPaymentData?.recurringPaymentDetails || [];

  const STATUS_LABELS = {
    '00': '已扣款',
    '01': '待扣款',
    '02': '扣款失敗',
    '03': '已終止定期定額',
  };

  return (
    <AppLayout title="定期定額訂單查詢" subtitle="查詢定期定額訂單的扣款設定與每期明細">
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
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="建立定期定額時的首期訂單號" />
            </div>
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '查詢中' : '查詢定期定額訂單'}
        </button>

        {result && (
          <>
            <TransactionResultCard
              success={isSuccess}
              retCode={result.retCode}
              rows={[
                { label: '商店代號', key: 'merid', value: result.merid },
                { label: '訂單建立日期', key: 'createtime', value: info?.createTime },
                { label: '週期種類', key: 'periodtype', value: info?.periodType },
                { label: '扣款頻率', key: 'deductfreq', value: info?.deductFreq },
                { label: '扣款總期數', key: 'deducttotalnum', value: info?.deductTotalNum },
                { label: '已扣款期數', key: 'deductchargednum', value: info?.deductChargedNum },
                { label: '卡號', key: 'maskpan', value: info?.maskPan },
                { label: '效期', key: 'expire', value: info?.expire },
              ]}
            />

            {details.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h2 className="section-title">扣款明細</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 4px' }}>期數</th>
                      <th style={{ padding: '8px 4px' }}>訂單編號</th>
                      <th style={{ padding: '8px 4px' }}>扣款狀態</th>
                      <th style={{ padding: '8px 4px' }}>預計扣款日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((d) => (
                      <tr key={d.periodNumber} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 4px' }}>{d.periodNumber}</td>
                        <td style={{ padding: '8px 4px' }}>{d.orderNumber}</td>
                        <td style={{ padding: '8px 4px' }}>{STATUS_LABELS[d.status] || d.status}</td>
                        <td style={{ padding: '8px 4px' }}>{d.estimatedDeductDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </form>
    </AppLayout>
  );
}
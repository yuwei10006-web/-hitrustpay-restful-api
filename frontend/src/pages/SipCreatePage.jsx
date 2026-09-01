import { useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startAuthorization } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import '../pages/Checkout.css';

export default function SipCreatePage() {
  const form = useOrderForm({ defaultOrderDesc: '定期定額訂單' });
  const [periods, setPeriods] = useState('');
  const [cycle, setCycle] = useState('');
  const [cycleType, setCycleType] = useState('M');
  const [subsequentSetting, setSubsequentSetting] = useState({
    phoneNumber: '', recurringStartDate: '', recurringTransAmount: '', recurringDepositFlag: '0',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);
    if (!periods || !cycle || !cycleType) {
      return setError('請填寫完整的定期定額設定（扣款期數、週期、週期種類）');
    }

    setLoading(true);
    try {
      const payload = {
        ...form.buildBasePayload(),
        recurringPaymentSetting: {
          periods,
          cycle,
          cycleType,
          subsequentSetting: {
            ...subsequentSetting,
            recurringTransAmount: subsequentSetting.recurringTransAmount
              ? Number(subsequentSetting.recurringTransAmount)
              : undefined,
          },
        },
      };

      const result = await startAuthorization(payload);
      if (!result.success) {
        setError(result.message || '建立定期定額訂單失敗，請稍後再試');
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
    <AppLayout title="建立定期定額訂單" subtitle="首期授權連同定期定額設定一起送出，持卡人在 HiTRUSTpay 頁面輸入卡號後即完成建立">
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
              <label>首期交易金額</label>
              <input type="number" min="1" value={form.amount} onChange={(e) => form.setAmount(e.target.value)} className="amount-input" />
            </div>
            <div className="field field-full">
              <label>訂單說明</label>
              <input maxLength={20} value={form.orderDesc} onChange={(e) => form.setOrderDesc(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">定期定額設定</h2>
          <div className="grid-2">
            <div className="field">
              <label>扣款期數 *</label>
              <input value={periods} onChange={(e) => setPeriods(e.target.value)} placeholder="數字，例：12" />
            </div>
            <div className="field">
              <label>扣款週期 *</label>
              <input value={cycle} onChange={(e) => setCycle(e.target.value)} placeholder="數字，例：1" />
            </div>
            <div className="field">
              <label>週期種類 *</label>
              <select value={cycleType} onChange={(e) => setCycleType(e.target.value)}>
                <option value="D">天</option>
                <option value="W">週</option>
                <option value="M">月</option>
                <option value="Y">年</option>
              </select>
            </div>
          </div>
        </div>

        <details className="advanced-section">
          <summary>次期設定（選填）</summary>
          <div className="grid-2">
            <div className="field">
              <label>消費者手機號</label>
              <input value={subsequentSetting.phoneNumber} onChange={(e) => setSubsequentSetting({ ...subsequentSetting, phoneNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>指定下次扣款日期</label>
              <input value={subsequentSetting.recurringStartDate} onChange={(e) => setSubsequentSetting({ ...subsequentSetting, recurringStartDate: e.target.value })} placeholder="yyyy-MM-dd" />
            </div>
            <div className="field">
              <label>指定下次扣款金額</label>
              <input type="number" min="0" value={subsequentSetting.recurringTransAmount} onChange={(e) => setSubsequentSetting({ ...subsequentSetting, recurringTransAmount: e.target.value })} />
            </div>
            <div className="field">
              <label>次期扣款類型</label>
              <select value={subsequentSetting.recurringDepositFlag} onChange={(e) => setSubsequentSetting({ ...subsequentSetting, recurringDepositFlag: e.target.value })}>
                <option value="0">一般交易</option>
                <option value="1">Sale 交易</option>
              </select>
            </div>
          </div>
        </details>

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
          </div>
        </details>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '建立定期定額訂單'}
        </button>
      </form>
    </AppLayout>
  );
}
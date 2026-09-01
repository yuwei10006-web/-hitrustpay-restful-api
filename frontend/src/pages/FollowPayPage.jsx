import { useEffect, useRef, useState } from 'react';
import { useOrderForm } from '../hooks/useOrderForm';
import { startAuthorization } from '../api/paymentApi';
import AppLayout from '../components/AppLayout';
import './Checkout.css';

const HITRUST_FP_SCRIPT_SRC = 'https://t-pay-web.hitrustpay.com.tw/static/TP/js/hitrust-fp-v2.0.0.js';
const HITRUST_FP_SCRIPT_ID = 'hitrust-fp-script';

export default function FollowPayPage() {
  const form = useOrderForm({ defaultOrderDesc: '隨身付(Follow Pay)測試' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const iframeRef = useRef(null);
  const tokenInputRef = useRef(null);

  // 依 HiTRUSTpay 文件要求，載入 Follow Pay 專用的 JS 資源
  useEffect(() => {
    if (!document.getElementById(HITRUST_FP_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = HITRUST_FP_SCRIPT_ID;
      script.src = HITRUST_FP_SCRIPT_SRC;
      document.body.appendChild(script);
    }
  }, []);

  // 拿到 token 後，設進 iframe 的 src 與隱藏欄位的 value（文件規定的做法）
  useEffect(() => {
    if (!token) return;
    if (iframeRef.current) iframeRef.current.src = token;
    if (tokenInputRef.current) tokenInputRef.current.value = token;
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToken('');

    const validationError = form.validateBase();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const result = await startAuthorization(form.buildBasePayload());
      if (!result.success) {
        setError(result.message || '交易發起失敗，請稍後再試');
        return;
      }
      setToken(result.data.token);
    } catch (err) {
      setError('無法連線到付款服務，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="隨身付(Follow Pay)" subtitle="嵌入式付款頁，持卡人不需離開商家網站即可完成付款">
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
          </div>
        </div>

        <button className="pay-button" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '處理中' : '產生付款頁'}
        </button>

        <div className="section">
          <h2 className="section-title">付款元件</h2>
          <p className="field-hint">
            {token
              ? '請在下方 iframe 內輸入信用卡資料完成付款'
              : '按上方「產生付款頁」後，這裡會顯示 HiTRUSTpay 的付款元件'}
          </p>
          <iframe
            id="hitrust_iframe"
            ref={iframeRef}
            frameBorder="0"
            scrolling="no"
            title="HiTRUSTpay Follow Pay"
            style={{ width: '100%', minHeight: token ? 420 : 0, border: token ? '1px solid var(--color-border)' : 'none', borderRadius: 'var(--radius)' }}
          />
          <input type="hidden" id="followPayToken" ref={tokenInputRef} />
          <button type="button" id="btn-hitrustpay" style={{ display: 'none' }}>
            Pay
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrder } from '../api/paymentApi';
import TransactionResultCard from '../components/TransactionResultCard';
import './PaymentResult.css';

export default function PaymentResult() {
  const [params] = useSearchParams();
  const ordernumber = params.get('ordernumber');
  const retcode = params.get('retcode');
  const isSuccess = retcode === '00';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!ordernumber) return;
    getOrder(ordernumber)
      .then((res) => {
        if (res.success) setOrder(res.data);
      })
      .catch(() => {});
  }, [ordernumber]);

    const rows = [
      { label: '商店代號', key: 'merid', value: order?.merid },
      { label: '訂單編號', key: 'ordernumber', value: ordernumber },
      { label: '訂單金額', key: 'amount', value: order?.amount },
      { label: '交易類別', key: 'type', value: order?.type || 'Auth' },
      { label: '卡號', key: 'cardnumber', value: order?.pan },
      { label: '交易序號', key: 'trxToken', value: order?.trxToken },
      { label: '到期日', key: 'expiry', value: order?.expiry },
    ];

  return (
    <div className="result-page">
      <div className="result-card">
        <div className={`result-icon ${isSuccess ? 'success' : 'failure'}`}>
          {isSuccess ? '✓' : '✕'}
        </div>
        <h1 className="result-title">{isSuccess ? '付款成功' : '付款未完成'}</h1>
        <TransactionResultCard
          success={isSuccess}
          retCode={retcode}
          rows={rows}
          note={
            isSuccess && !order?.pan
              ? '若卡號未顯示，需先向 HiTRUSTpay 申請開啟遮罩卡號回傳功能'
              : null
          }
        />
      </div>
    </div>
  );
}
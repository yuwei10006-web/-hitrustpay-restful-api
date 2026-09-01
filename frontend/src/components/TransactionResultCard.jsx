import { useEffect, useState } from 'react';
import './TransactionResultCard.css';

function AnimatedValue({ value }) {
  const isPureNumber =
    typeof value === 'number' ||
    (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim()));
  const [display, setDisplay] = useState(isPureNumber ? 0 : value);

  useEffect(() => {
    if (!isPureNumber) {
      setDisplay(value);
      return;
    }
    const target = Number(value);
    const decimals = (String(value).split('.')[1] || '').length;
    const duration = 600;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay((target * eased).toFixed(decimals));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, isPureNumber]);

  return <>{display}</>;
}

export default function TransactionResultCard({ success, retCode, rows, note }) {
  const visibleRows = rows.filter(
    (r) => r.value !== null && r.value !== undefined && r.value !== ''
  );

  return (
    <div className={`tx-result ${success ? 'success' : 'failure'}`}>
      <div className="tx-result-header">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" className="tx-result-icon">
          <circle cx="12" cy="12" r="10" className="tx-result-icon-ring" />
          {success ? (
            <path d="M7 12.5l3 3 7-7" className="tx-result-icon-check" />
          ) : (
            <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" className="tx-result-icon-check" />
          )}
        </svg>
        <span>{success ? '交易成功' : '交易失敗'} retcode={retCode}</span>
      </div>
      <div className="tx-result-divider" />
      <dl className="tx-result-rows">
        {visibleRows.map((r) => (
          <div className="tx-result-row" key={r.key}>
            <dt>{r.label}（{r.key}）</dt>
            <dd><AnimatedValue value={r.value} /></dd>
          </div>
        ))}
      </dl>
      {note && <p className="tx-result-note">{note}</p>}
    </div>
  );
}
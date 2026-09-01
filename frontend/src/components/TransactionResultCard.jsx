import './TransactionResultCard.css';

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
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="tx-result-note">{note}</p>}
    </div>
  );
}
import './AppLayout.css';

export default function AppLayout({ title, subtitle, children }) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className="env-badge">測試環境</span>
      </header>
      <div className="app-content">{children}</div>
    </div>
  );
}
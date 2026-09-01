import AppLayout from '../components/AppLayout';

export default function ComingSoonPage({ title }) {
  return (
    <AppLayout title={title} subtitle="這支 API 還沒開始串接">
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)', padding: '48px 32px', textAlign: 'center',
        color: 'var(--color-muted)', fontSize: 14,
      }}>
        做完後會顯示在這裡，可以先從側邊欄回到「授權」測試。
      </div>
    </AppLayout>
  );
}
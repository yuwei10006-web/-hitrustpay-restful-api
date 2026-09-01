import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import AuthorizationPage from './pages/AuthorizationPage';
import AuthorizationSslPage from './pages/AuthorizationSslPage';
import PaymentResult from './pages/PaymentResult';
import AuthorizationReversePage from './pages/AuthorizationReversePage';
import CapturePage from './pages/CapturePage';
import CaptureReversePage from './pages/CaptureReversePage';
import RefundPage from './pages/RefundPage';
import RefundReversePage from './pages/RefundReversePage';
import QueryOrderPage from './pages/QueryOrderPage';
import AuthorizationSslTokenPage from './pages/AuthorizationSslTokenPage';
import AuthorizationTokenPage from './pages/AuthorizationTokenPage';
import SipQueryPage from './pages/SipQueryPage';
import SipCancelPage from './pages/SipCancelPage';
import SipCreatePage from './pages/SipCreatePage';
import FollowPayPage from './pages/FollowPayPage';
import ApplePayPage from './pages/ApplePayPage';
import LinePayPage from './pages/LinePayPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/authorization" replace />} />
          <Route path="/authorization" element={<AuthorizationPage />} />
          <Route path="/authorization-ssl" element={<AuthorizationSslPage />} />
          <Route path="/authorization-reverse" element={<AuthorizationReversePage />} />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/capture-reverse" element={<CaptureReversePage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/refund-reverse" element={<RefundReversePage />} />
          <Route path="/query" element={<QueryOrderPage />} />
          <Route path="/authorization-ssl-token" element={<AuthorizationSslTokenPage />} />
          <Route path="/authorization-3d-token" element={<AuthorizationTokenPage />} />
          <Route path="/sip-query" element={<SipQueryPage />} />
          <Route path="/sip-cancel" element={<SipCancelPage />} />
          <Route path="/sip-create" element={<SipCreatePage />} />
          <Route path="/follow-pay" element={<FollowPayPage />} />
          <Route path="/apple-pay" element={<ApplePayPage />} />
          <Route path="/line-pay" element={<LinePayPage />} />
        </Route>
        <Route path="/payment-result" element={<PaymentResult />} />
      </Routes>
    </BrowserRouter>
  );
}
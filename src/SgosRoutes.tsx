import { Navigate, Routes, Route } from 'react-router-dom';
import SGOSLayout from './pages/sgos/SGOSLayout';
import CommandCenter from './pages/sgos/CommandCenter';
import FieldTag from './pages/sgos/FieldTag';
import BatchLog from './pages/sgos/BatchLog';
import Dispatch from './pages/sgos/Dispatch';
import Ack from './pages/sgos/Ack';
import ActivityLog from './pages/sgos/ActivityLog';
import SgosSettingsPage from './pages/sgos/SgosSettings';
import { sgosLocaleRedirect } from './i18n/useSgosLocale';
import { DEFAULT_LOCALE } from './i18n/locales';

function SgosLocaleRedirect() {
  return <Navigate to={sgosLocaleRedirect()} replace />;
}

export default function SgosRoutes() {
  return (
    <Routes>
      <Route path="/sgos" element={<SgosLocaleRedirect />} />
      <Route path={`/sgos/:locale`} element={<SGOSLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="field-tag" element={<FieldTag />} />
        <Route path="batch-log" element={<BatchLog />} />
        <Route path="dispatch" element={<Dispatch />} />
        <Route path="ack" element={<Ack />} />
        <Route path="logs" element={<ActivityLog />} />
        <Route path="settings" element={<SgosSettingsPage />} />
      </Route>
      {/* legacy paths without locale → redirect */}
      <Route path="/sgos/field-tag" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/field-tag`} replace />} />
      <Route path="/sgos/batch-log" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/batch-log`} replace />} />
      <Route path="/sgos/dispatch" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/dispatch`} replace />} />
      <Route path="/sgos/ack" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/ack`} replace />} />
      <Route path="/sgos/logs" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/logs`} replace />} />
      <Route path="/sgos/settings" element={<Navigate to={`/sgos/${DEFAULT_LOCALE}/settings`} replace />} />
    </Routes>
  );
}

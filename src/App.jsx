import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import InterestAdd from './pages/interest/InterestAdd';
import InterestList from './pages/interest/InterestList';
import LanguageAdd from './pages/language/LanguageAdd';
import LanguageList from './pages/language/LanguageList';
import ReligionAdd from './pages/religion/ReligionAdd';
import ReligionList from './pages/religion/ReligionList';
import GiftAdd from './pages/gift/GiftAdd';
import GiftList from './pages/gift/GiftList';
import RelationGoalAdd from './pages/relationgoal/RelationGoalAdd';
import RelationGoalList from './pages/relationgoal/RelationGoalList';
import FaqAdd from './pages/faq/FaqAdd';
import FaqList from './pages/faq/FaqList';
import PlanAdd from './pages/plan/PlanAdd';
import PlanList from './pages/plan/PlanList';
import PackageAdd from './pages/package/PackageAdd';
import PackageList from './pages/package/PackageList';
import StaffAdd from './pages/staff/StaffAdd';
import StaffList from './pages/staff/StaffList';
import PaymentList from './pages/PaymentList';
import FakeUserGenerator from './pages/FakeUserGenerator';
import ReportList from './pages/ReportList';
import PageAdd from './pages/pages/PageAdd';
import PageList from './pages/pages/PageList';
import PayoutList from './pages/PayoutList';
import UserList from './pages/UserList';
import UserAdd from './pages/UserAdd';
import PushNotification from './pages/PushNotification';
import VerificationList from './pages/VerificationList';
import ProfileSettings from './pages/ProfileSettings';

function PermissionRoute({ children, moduleKey, op = 'Read' }) {
  const { hasPermission, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="loading-spinner" /></div>;
  
  const hasAccess = hasPermission(moduleKey, op);
  if (!hasAccess) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: 16 }}>
          ⚠️
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 12, fontWeight: 700 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem', lineHeight: '1.5' }}>
          You do not have the required permissions ({moduleKey} - {op}) to access this page. Please contact your system administrator for assistance.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
          Go to Dashboard
        </button>
      </div>
    );
  }
  return children;
}

function AdminOnlyRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="loading-spinner" /></div>;
  if (!admin || admin.role !== 'superadmin') {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: 16 }}>
          ⚠️
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 12, fontWeight: 700 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem', lineHeight: '1.5' }}>
          This page is restricted to system administrators only.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
          Go to Dashboard
        </button>
      </div>
    );
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="loading-spinner" /></div>;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="interest/add" element={<PermissionRoute moduleKey="interest" op="Write"><InterestAdd /></PermissionRoute>} />
        <Route path="interest/list" element={<PermissionRoute moduleKey="interest" op="Read"><InterestList /></PermissionRoute>} />
        <Route path="language/add" element={<PermissionRoute moduleKey="language" op="Write"><LanguageAdd /></PermissionRoute>} />
        <Route path="language/list" element={<PermissionRoute moduleKey="language" op="Read"><LanguageList /></PermissionRoute>} />
        <Route path="religion/add" element={<PermissionRoute moduleKey="religion" op="Write"><ReligionAdd /></PermissionRoute>} />
        <Route path="religion/list" element={<PermissionRoute moduleKey="religion" op="Read"><ReligionList /></PermissionRoute>} />
        <Route path="gift/add" element={<PermissionRoute moduleKey="gift" op="Write"><GiftAdd /></PermissionRoute>} />
        <Route path="gift/list" element={<PermissionRoute moduleKey="gift" op="Read"><GiftList /></PermissionRoute>} />
        <Route path="relation-goal/add" element={<PermissionRoute moduleKey="relationGoals" op="Write"><RelationGoalAdd /></PermissionRoute>} />
        <Route path="relation-goal/list" element={<PermissionRoute moduleKey="relationGoals" op="Read"><RelationGoalList /></PermissionRoute>} />
        <Route path="faq/add" element={<PermissionRoute moduleKey="faq" op="Write"><FaqAdd /></PermissionRoute>} />
        <Route path="faq/list" element={<PermissionRoute moduleKey="faq" op="Read"><FaqList /></PermissionRoute>} />
        <Route path="plan/add" element={<PermissionRoute moduleKey="plan" op="Write"><PlanAdd /></PermissionRoute>} />
        <Route path="plan/list" element={<PermissionRoute moduleKey="plan" op="Read"><PlanList /></PermissionRoute>} />
        <Route path="package/add" element={<PermissionRoute moduleKey="package" op="Write"><PackageAdd /></PermissionRoute>} />
        <Route path="package/list" element={<PermissionRoute moduleKey="package" op="Read"><PackageList /></PermissionRoute>} />
        <Route path="staff/add" element={<AdminOnlyRoute><StaffAdd /></AdminOnlyRoute>} />
        <Route path="staff/list" element={<AdminOnlyRoute><StaffList /></AdminOnlyRoute>} />
        <Route path="payment-list" element={<PermissionRoute moduleKey="paymentGateway" op="Read"><PaymentList /></PermissionRoute>} />
        <Route path="fake-user-generator" element={<PermissionRoute moduleKey="fakeUser" op="Update"><FakeUserGenerator /></PermissionRoute>} />
        <Route path="report-list" element={<PermissionRoute moduleKey="report" op="Read"><ReportList /></PermissionRoute>} />
        <Route path="page/add" element={<PermissionRoute moduleKey="pages" op="Write"><PageAdd /></PermissionRoute>} />
        <Route path="page/list" element={<PermissionRoute moduleKey="pages" op="Read"><PageList /></PermissionRoute>} />
        <Route path="payout-list" element={<PermissionRoute moduleKey="payout" op="Read"><PayoutList /></PermissionRoute>} />
        <Route path="user-list" element={<PermissionRoute moduleKey="userList" op="Read"><UserList /></PermissionRoute>} />
        <Route path="user/add" element={<PermissionRoute moduleKey="userList" op="Write"><UserAdd /></PermissionRoute>} />
        <Route path="verification-list" element={<PermissionRoute moduleKey="userList" op="Read"><VerificationList /></PermissionRoute>} />
        <Route path="push-notification" element={<PermissionRoute moduleKey="notification" op="Write"><PushNotification /></PermissionRoute>} />
        <Route path="settings" element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
}

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
import PushNotification from './pages/PushNotification';

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
        <Route path="interest/add" element={<InterestAdd />} />
        <Route path="interest/list" element={<InterestList />} />
        <Route path="language/add" element={<LanguageAdd />} />
        <Route path="language/list" element={<LanguageList />} />
        <Route path="religion/add" element={<ReligionAdd />} />
        <Route path="religion/list" element={<ReligionList />} />
        <Route path="gift/add" element={<GiftAdd />} />
        <Route path="gift/list" element={<GiftList />} />
        <Route path="relation-goal/add" element={<RelationGoalAdd />} />
        <Route path="relation-goal/list" element={<RelationGoalList />} />
        <Route path="faq/add" element={<FaqAdd />} />
        <Route path="faq/list" element={<FaqList />} />
        <Route path="plan/add" element={<PlanAdd />} />
        <Route path="plan/list" element={<PlanList />} />
        <Route path="package/add" element={<PackageAdd />} />
        <Route path="package/list" element={<PackageList />} />
        <Route path="staff/add" element={<StaffAdd />} />
        <Route path="staff/list" element={<StaffList />} />
        <Route path="payment-list" element={<PaymentList />} />
        <Route path="fake-user-generator" element={<FakeUserGenerator />} />
        <Route path="report-list" element={<ReportList />} />
        <Route path="page/add" element={<PageAdd />} />
        <Route path="page/list" element={<PageList />} />
        <Route path="payout-list" element={<PayoutList />} />
        <Route path="user-list" element={<UserList />} />
        <Route path="push-notification" element={<PushNotification />} />
      </Route>
    </Routes>
  );
}

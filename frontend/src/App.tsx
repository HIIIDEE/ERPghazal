import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Login } from './pages/Login';
import EmployeeDetails from './pages/EmployeeDetails';
import { Contracts } from './pages/Contracts';
import HrConfiguration from './features/hr/HrConfiguration';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Payroll } from './pages/Payroll';
import EmployeeRubriques from './pages/EmployeeRubriques';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="rubriques" element={<EmployeeRubriques />} />
          <Route path="config" element={<HrConfiguration />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

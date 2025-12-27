import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css"
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import MainComponent from "./pages/MainComponent";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import DBDTruckDrivers from "./pages/DBDTruckDrivers";
import Overview from "./pages/Overview";
import RoutesPage from "./pages/Routes";
import Locations from "./pages/Locations";
import Schedule from "./pages/Schedule";
import Reports from "./pages/Reports";
import 'leaflet/dist/leaflet.css';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/main" element={
          <ProtectedRoute>
            <MainComponent />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Navigate to="drivers" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="drivers" element={<DBDTruckDrivers />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="locations" element={<Locations />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css"
import Login from "./pages/Login";
import MainComponent from "./pages/MainComponent";
import ProtectedRoute from "./components/ProtectedRoute";
import 'leaflet/dist/leaflet.css';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={
          <ProtectedRoute>
            <MainComponent />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
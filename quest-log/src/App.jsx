import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext/AuthContext";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import Leaderboard from "./components/Leaderboard/Leaderboard";

// A "Protected Route" component to block unauthorized users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While Firebase is checking if you're logged in, show nothing or a loader
  if (loading) return null;

  return user ? children : <Navigate to="/auth" />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/leaderboard" element={<Leaderboard />} />).

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
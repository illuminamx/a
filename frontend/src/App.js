import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/Toast";
import Catalogo from "./components/Catalogo";
import AdminPanel from "./components/AdminPanel";
import PanelVentas from "./components/PanelVentas";
import Login from "./components/Login";

// Hook para cambiar el título según la ruta
function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/admin') {
      document.title = 'Administrador | Jessica Ale Suarez';
    } else if (location.pathname === '/ventas') {
      document.title = 'Panel de Ventas | Jessica Ale Suarez';
    } else {
      document.title = 'Catálogo | Jessica Ale Suarez';
    }
  }, [location]);
}

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  useDocumentTitle();

  return (
    <Routes>
      {/* Catálogo público - Ruta principal */}
      <Route path="/" element={<Catalogo />} />
      
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Panel de administración - Requiere autenticación */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Panel de ventas - Requiere autenticación */}
      <Route
        path="/ventas"
        element={
          <ProtectedRoute>
            <PanelVentas />
          </ProtectedRoute>
        }
      />

      {/* Cualquier otra ruta redirige al catálogo */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

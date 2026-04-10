import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Moon, Sun, LayoutDashboard, Users, ShoppingBag, 
  DollarSign, FileText
} from 'lucide-react';
import ProductosVenta from './ventas/ProductosVenta';
import ClientesPanel from './ventas/ClientesPanel';
import CarritoPanel from './ventas/CarritoPanel';
import PedidosPanel from './ventas/PedidosPanel';
import AdeudosPanel from './ventas/AdeudosPanel';

const PanelVentas = () => {
  const [activeTab, setActiveTab] = useState('productos');
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { clientName } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadClientes();
    loadPedidos();
  }, []);

  const loadClientes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const loadPedidos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pedidos'));
      const pedidosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const tabs = [
    { id: 'productos', label: 'Productos', icon: ShoppingBag },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'pedidos', label: 'Pedidos', icon: FileText },
    { id: 'adeudos', label: 'Adeudos', icon: DollarSign }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg ${
        isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingBag size={24} />
              <div>
                <h1 className="text-2xl font-bold">Panel de Ventas</h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cliente: <span className="font-medium">{clientName}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Admin</span>
              </button>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : isDark
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'productos' && <ProductosVenta />}
            {activeTab === 'clientes' && (
              <ClientesPanel 
                clientes={clientes}
                onClientesChange={loadClientes}
              />
            )}
            {activeTab === 'pedidos' && (
              <PedidosPanel 
                pedidos={pedidos}
                onPedidosChange={loadPedidos}
              />
            )}
            {activeTab === 'adeudos' && (
              <AdeudosPanel 
                pedidos={pedidos.filter(p => p.adeudo > 0)}
                onPedidosChange={loadPedidos}
              />
            )}
          </div>

          {/* Right Panel - Cart (only on productos tab) */}
          {activeTab === 'productos' && (
            <div className="lg:col-span-1">
              <CarritoPanel 
                onPedidoCreated={() => {
                  loadPedidos();
                  loadClientes();
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PanelVentas;

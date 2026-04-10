import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Edit2, Trash2, Save, X, Moon, Sun, 
  Upload, Image as ImageIcon, ShoppingCart, LayoutDashboard
} from 'lucide-react';
import ProductFormModal from './ProductFormModal';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'productos', productId));
      setProducts(products.filter(p => p.id !== productId));
      showToast('Producto eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      showToast('Error al eliminar producto', 'error');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Actualizar producto existente
        await updateDoc(doc(db, 'productos', editingProduct.id), productData);
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
        showToast('Producto actualizado correctamente', 'success');
      } else {
        // Crear nuevo producto
        const docRef = await addDoc(collection(db, 'productos'), productData);
        setProducts([...products, { id: docRef.id, ...productData }]);
        showToast('Producto creado correctamente', 'success');
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error guardando producto:', error);
      showToast('Error al guardar producto', 'error');
    }
  };

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
              <LayoutDashboard size={24} />
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/ventas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                <ShoppingCart size={18} />
                <span className="hidden md:inline">Ventas</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                Ver Catálogo
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Productos ({products.length})
          </h2>
          <button
            onClick={handleAddProduct}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Plus size={18} />
            Agregar Producto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDark ? 'border-white' : 'border-black'
            }`}></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon size={48} className={`mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No hay productos. Agrega tu primer producto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
                  isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      <ImageIcon size={48} className={
                        isDark ? 'text-gray-600' : 'text-gray-400'
                      } />
                    </div>
                  )}
                  {product.imagenes && product.imagenes.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      +{product.imagenes.length - 1}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
                  {product.descripcion && (
                    <p className={`text-sm mb-3 line-clamp-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {product.descripcion}
                    </p>
                  )}

                  {/* Prices */}
                  <div className="space-y-1 mb-4">
                    {product.pieza && (
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Pieza:
                        </span>
                        <span className="font-medium">${product.pieza}</span>
                      </div>
                    )}
                    {product.mayoreo && (
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Mayoreo:
                        </span>
                        <span className="font-medium">${product.mayoreo}</span>
                      </div>
                    )}
                    {product.caja && (
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Caja:
                        </span>
                        <span className="font-medium">${product.caja}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;

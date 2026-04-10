import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('LOCAL');
  const [selectedClient, setSelectedClient] = useState(null);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, priceType = 'pieza', customPrice = null) => {
    const existingItem = cart.find(
      item => item.id === product.id && item.priceType === priceType
    );

    if (existingItem) {
      setCart(
        cart.map(item =>
          item.id === product.id && item.priceType === priceType
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity,
          priceType,
          customPrice,
          unitPrice: customPrice || product[priceType] || product.pieza
        }
      ]);
    }
  };

  const removeFromCart = (productId, priceType) => {
    setCart(cart.filter(item => !(item.id === productId && item.priceType === priceType)));
  };

  const updateQuantity = (productId, priceType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, priceType);
    } else {
      setCart(
        cart.map(item =>
          item.id === productId && item.priceType === priceType
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setClientName('LOCAL');
    setSelectedClient(null);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        clientName,
        selectedClient,
        setClientName,
        setSelectedClient,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

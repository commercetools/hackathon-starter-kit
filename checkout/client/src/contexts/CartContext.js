import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'ADD_ITEM':
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          lineItems: [...state.cart.lineItems, action.payload]
        }
      };
    case 'UPDATE_ITEM_QUANTITY':
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          lineItems: state.cart.lineItems.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        }
      };
    case 'REMOVE_ITEM':
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          lineItems: state.cart.lineItems.filter(item => item.id !== action.payload)
        }
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: null
      };
    default:
      return state;
  }
};

const initialState = {
  cart: null,
  loading: false,
  error: null
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Initialize cart on app load
  useEffect(() => {
    const savedCartId = localStorage.getItem('cartId');
    if (savedCartId) {
      loadCart(savedCartId);
    }
  }, []);

  const loadCart = async (cartId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // In a real implementation, you would fetch the cart from the API
      // For now, we'll store the cart data locally
      const savedCart = localStorage.getItem(`cart-${cartId}`);
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: cart });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.createCart({
        productId,
        quantity,
        currency: 'USD',
        country: 'US'
      });

      const cart = response.cart;
      dispatch({ type: 'SET_CART', payload: cart });

      // Save cart to localStorage
      localStorage.setItem('cartId', cart.id);
      localStorage.setItem(`cart-${cart.id}`, JSON.stringify(cart));

      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (!state.cart) {
        // Create new cart
        return await createCart(product.id, quantity);
      }

      // For demo purposes, we'll add items locally
      // In a real implementation, you would call the API to add to cart
      const newItem = {
        id: `item-${Date.now()}`,
        name: product.name,
        quantity: quantity,
        price: product.masterVariant.prices[0],
        totalPrice: {
          ...product.masterVariant.prices[0],
          centAmount: product.masterVariant.prices[0].centAmount * quantity
        },
        productId: product.id,
        variantId: product.masterVariant.id
      };

      dispatch({ type: 'ADD_ITEM', payload: newItem });

      // Update localStorage
      const updatedCart = {
        ...state.cart,
        lineItems: [...state.cart.lineItems, newItem]
      };
      localStorage.setItem(`cart-${state.cart.id}`, JSON.stringify(updatedCart));

      return updatedCart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id: itemId, quantity } });

    // Update localStorage
    const updatedCart = {
      ...state.cart,
      lineItems: state.cart.lineItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: quantity }
          : item
      )
    };
    localStorage.setItem(`cart-${state.cart.id}`, JSON.stringify(updatedCart));
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });

    // Update localStorage
    const updatedCart = {
      ...state.cart,
      lineItems: state.cart.lineItems.filter(item => item.id !== itemId)
    };
    localStorage.setItem(`cart-${state.cart.id}`, JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (state.cart) {
      localStorage.removeItem('cartId');
      localStorage.removeItem(`cart-${state.cart.id}`);
    }
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    if (!state.cart || !state.cart.lineItems) return 0;
    return state.cart.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!state.cart || !state.cart.lineItems) return { centAmount: 0, currencyCode: 'USD' };

    const total = state.cart.lineItems.reduce(
      (sum, item) => sum + (item.totalPrice?.centAmount || 0),
      0
    );

    return {
      centAmount: total,
      currencyCode: state.cart.lineItems[0]?.price?.currencyCode || 'USD'
    };
  };

  const value = {
    ...state,
    createCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
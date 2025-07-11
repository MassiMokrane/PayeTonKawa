import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import productService from "../services/productService";
import orderService from "../services/orderService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.warn("Erreur lors du chargement du panier:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.warn("Erreur lors de la sauvegarde du panier:", error);
    }
  }, [cartItems]);

  // Ajouter un produit au panier
  const addToCart = async (product, quantity = 1) => {
    if (!product || !product.id) {
      console.error("Produit invalide:", product);
      return;
    }

    try {
      // Récupérer les informations complètes du produit depuis l'API
      const fullProduct = await productService.getProductById(product.id);

      if (!productService.isProductAvailable(fullProduct)) {
        toast.error("Ce produit n'est plus disponible");
        return;
      }

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          // Vérifier si la nouvelle quantité ne dépasse pas le stock
          if (newQuantity > fullProduct.quantity) {
            toast.warning(
              `Stock maximum: ${fullProduct.quantity}. Quantité ajustée.`
            );
            return prevItems.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: fullProduct.quantity,
                    maxQuantity: fullProduct.quantity,
                  }
                : item
            );
          }

          return prevItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: newQuantity,
                  maxQuantity: fullProduct.quantity,
                }
              : item
          );
        } else {
          // Vérifier si la quantité demandée ne dépasse pas le stock
          const validQuantity = Math.min(quantity, fullProduct.quantity);

          if (validQuantity < quantity) {
            toast.warning(
              `Stock maximum: ${fullProduct.quantity}. Quantité ajustée.`
            );
          }

          return [
            ...prevItems,
            {
              ...fullProduct,
              quantity: validQuantity,
              maxQuantity: fullProduct.quantity,
            },
          ];
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error("Erreur lors de l'ajout au panier");
    }
  };

  // Supprimer un produit du panier
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  // Mettre à jour la quantité d'un produit avec validation du stock
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      // Récupérer les informations actuelles du produit pour vérifier le stock
      const product = await productService.getProductById(productId);

      if (!productService.isProductAvailable(product)) {
        toast.error("Ce produit n'est plus disponible");
        removeFromCart(productId);
        return;
      }

      // Limiter la quantité au stock disponible
      const validQuantity = Math.min(quantity, product.quantity);

      if (validQuantity < quantity) {
        toast.warning(`Stock maximum: ${product.quantity}`);
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: validQuantity,
                maxQuantity: product.quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      toast.error("Erreur lors de la mise à jour de la quantité");
    }
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("cart");
    } catch (error) {
      console.warn("Erreur lors de la suppression du panier:", error);
    }
  };

  // Calculer le nombre total d'articles
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculer le total du panier
  const getCartTotal = () => {
    return orderService.calculateCartTotal(cartItems);
  };

  // Vérifier et mettre à jour les stocks avant le checkout
  const validateCartStock = async () => {
    const updatedItems = [];
    let hasChanges = false;

    for (const item of cartItems) {
      try {
        const product = await productService.getProductById(item.id);

        if (!productService.isProductAvailable(product)) {
          toast.warning(
            `${item.name} n'est plus disponible et a été retiré du panier`
          );
          hasChanges = true;
          continue;
        }

        if (item.quantity > product.quantity) {
          toast.warning(
            `${item.name}: quantité réduite de ${item.quantity} à ${product.quantity}`
          );
          updatedItems.push({
            ...item,
            quantity: product.quantity,
            maxQuantity: product.quantity,
          });
          hasChanges = true;
        } else {
          updatedItems.push({ ...item, maxQuantity: product.quantity });
        }
      } catch (error) {
        console.error(
          `Erreur lors de la vérification du produit ${item.id}:`,
          error
        );
        toast.error(`Erreur lors de la vérification de ${item.name}`);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setCartItems(updatedItems);
      return false; // Indique que des changements ont été apportés
    }

    return true; // Pas de changements, checkout peut continuer
  };

  // Finaliser la commande avec validation du stock
  const checkout = async () => {
    if (!user?.isAuthenticated) {
      throw new Error("Utilisateur non authentifié");
    }

    if (cartItems.length === 0) {
      throw new Error("Panier vide");
    }

    setIsLoading(true);

    try {
      // Vérifier les stocks avant de procéder
      const stockValid = await validateCartStock();

      if (!stockValid) {
        throw new Error(
          "Le panier a été mis à jour suite à des changements de stock. Veuillez vérifier et réessayer."
        );
      }

      const orderData = {
        userId: user.id,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.createOrder(orderData);
      clearCart();
      return response;
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    checkout,
    isLoading,
    validateCartStock,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

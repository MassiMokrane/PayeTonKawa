// // import React, { createContext, useContext, useState, useEffect } from "react";
// // import orderService from "../services/orderService";

// // const CartContext = createContext();

// // export const useCart = () => {
// //   const context = useContext(CartContext);
// //   if (!context) {
// //     throw new Error("useCart must be used within a CartProvider");
// //   }
// //   return context;
// // };

// // export const CartProvider = ({ children }) => {
// //   const [cartItems, setCartItems] = useState([]);
// //   const [isLoading, setIsLoading] = useState(false);

// //   // Charger le panier depuis localStorage au démarrage
// //   useEffect(() => {
// //     const savedCart = localStorage.getItem("cart");
// //     if (savedCart) {
// //       setCartItems(JSON.parse(savedCart));
// //     }
// //   }, []);

// //   // Sauvegarder le panier dans localStorage à chaque changement
// //   useEffect(() => {
// //     localStorage.setItem("cart", JSON.stringify(cartItems));
// //   }, [cartItems]);

// //   // Ajouter un produit au panier
// //   const addToCart = (product, quantity = 1) => {
// //     setCartItems((prevItems) => {
// //       const existingItem = prevItems.find((item) => item.id === product.id);

// //       if (existingItem) {
// //         // Si le produit existe déjà, augmenter la quantité
// //         return prevItems.map((item) =>
// //           item.id === product.id
// //             ? { ...item, quantity: item.quantity + quantity }
// //             : item
// //         );
// //       } else {
// //         // Sinon, ajouter le nouveau produit
// //         return [...prevItems, { ...product, quantity }];
// //       }
// //     });
// //   };

// //   // Supprimer un produit du panier
// //   const removeFromCart = (productId) => {
// //     setCartItems((prevItems) =>
// //       prevItems.filter((item) => item.id !== productId)
// //     );
// //   };

// //   // Mettre à jour la quantité d'un produit
// //   const updateQuantity = (productId, quantity) => {
// //     if (quantity <= 0) {
// //       removeFromCart(productId);
// //       return;
// //     }

// //     setCartItems((prevItems) =>
// //       prevItems.map((item) =>
// //         item.id === productId ? { ...item, quantity } : item
// //       )
// //     );
// //   };

// //   // Vider le panier
// //   const clearCart = () => {
// //     setCartItems([]);
// //     localStorage.removeItem("cart");
// //   };

// //   // Calculer le nombre total d'articles
// //   const getCartCount = () => {
// //     return cartItems.reduce((total, item) => total + item.quantity, 0);
// //   };

// //   // Calculer le total du panier
// //   const getCartTotal = () => {
// //     return orderService.calculateCartTotal(cartItems);
// //   };

// //   // Finaliser la commande
// //   const checkout = async (customerInfo) => {
// //     setIsLoading(true);
// //     try {
// //       const orderData = {
// //         items: cartItems,
// //         total: getCartTotal(),
// //         customerInfo,
// //         status: "pending",
// //       };

// //       const result = await orderService.createOrder(orderData);
// //       clearCart();
// //       return result;
// //     } catch (error) {
// //       throw error;
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const value = {
// //     cartItems,
// //     addToCart,
// //     removeFromCart,
// //     updateQuantity,
// //     clearCart,
// //     getCartCount,
// //     getCartTotal,
// //     checkout,
// //     isLoading,
// //   };

// //   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// // };
// import React, { createContext, useContext, useState, useEffect } from "react";
// import orderService from "../services/orderService";

// const CartContext = createContext();

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// };

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Charger le panier depuis localStorage au démarrage
//   useEffect(() => {
//     try {
//       const savedCart = localStorage.getItem("cart");
//       if (savedCart) {
//         const parsedCart = JSON.parse(savedCart);
//         if (Array.isArray(parsedCart)) {
//           setCartItems(parsedCart);
//         }
//       }
//     } catch (error) {
//       console.warn("Erreur lors du chargement du panier:", error);
//       // En cas d'erreur, on nettoie le localStorage
//       localStorage.removeItem("cart");
//     }
//   }, []);

//   // Sauvegarder le panier dans localStorage à chaque changement
//   useEffect(() => {
//     try {
//       localStorage.setItem("cart", JSON.stringify(cartItems));
//     } catch (error) {
//       console.warn("Erreur lors de la sauvegarde du panier:", error);
//     }
//   }, [cartItems]);

//   // Ajouter un produit au panier
//   const addToCart = (product, quantity = 1) => {
//     if (!product || !product.id) {
//       console.error("Produit invalide:", product);
//       return;
//     }

//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === product.id);

//       if (existingItem) {
//         // Si le produit existe déjà, augmenter la quantité
//         return prevItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       } else {
//         // Sinon, ajouter le nouveau produit
//         return [...prevItems, { ...product, quantity }];
//       }
//     });
//   };

//   // Supprimer un produit du panier
//   const removeFromCart = (productId) => {
//     setCartItems((prevItems) =>
//       prevItems.filter((item) => item.id !== productId)
//     );
//   };

//   // Mettre à jour la quantité d'un produit
//   const updateQuantity = (productId, quantity) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }

//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   // Vider le panier
//   const clearCart = () => {
//     setCartItems([]);
//     try {
//       localStorage.removeItem("cart");
//     } catch (error) {
//       console.warn("Erreur lors de la suppression du panier:", error);
//     }
//   };

//   // Calculer le nombre total d'articles
//   const getCartCount = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };

//   // Calculer le total du panier
//   const getCartTotal = () => {
//     return orderService.calculateCartTotal(cartItems);
//   };

//   // Finaliser la commande
//   const checkout = async (customerInfo) => {
//     if (!customerInfo) {
//       throw new Error("Informations client manquantes");
//     }

//     setIsLoading(true);
//     try {
//       const orderData = {
//         items: cartItems,
//         total: getCartTotal(),
//         customerInfo,
//         status: "pending",
//       };

//       const result = await orderService.createOrder(orderData);
//       clearCart();
//       return result;
//     } catch (error) {
//       console.error("Erreur lors de la commande:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const value = {
//     cartItems,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getCartCount,
//     getCartTotal,
//     checkout,
//     isLoading,
//   };

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };
import React, { createContext, useContext, useState, useEffect } from "react";
import orderService from "../services/orderService";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.warn("Erreur lors du chargement du panier:", error);
      // En cas d'erreur, on nettoie le localStorage
      localStorage.removeItem("cart");
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
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) {
      console.error("Produit invalide:", product);
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Si le produit existe déjà, augmenter la quantité
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Sinon, ajouter le nouveau produit
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Supprimer un produit du panier
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
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

  // Finaliser la commande (version simplifiée sans informations client)
  const checkout = async () => {
    if (cartItems.length === 0) {
      throw new Error("Panier vide");
    }

    setIsLoading(true);
    try {
      // Préparer les données pour le backend
      const orderData = {
        userId: 1, // ID utilisateur temporaire - à remplacer par l'ID réel de l'utilisateur connecté
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      console.log("Données envoyées au backend:", orderData);

      const result = await orderService.createOrder(orderData);
      clearCart();
      return result;
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

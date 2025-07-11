import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context - Import corrigé
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // Ajout du CartProvider

// Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
// import Loading from "./components/common/Loading";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
// Composants Orders
import Cart from "./components/orders/Cart";
import OrderList from "./components/orders/OrderList";
import OrderDetails from "./components/orders/OrderDetails";
// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Admin Components
// Admin Pages
import AdminDashboard from "./components/admin/AdminDashboard";
import ProductManager from "./components/admin/ProductManager";
import OrderManager from "./components/admin/OrderManager";
import UserManager from "./components/admin/UserManager";
// Protected Route Component
import ProtectedRoute from "./components/common/ProtectedRoute";

// Styles
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {" "}
        {/* Ajout du CartProvider */}
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Authentification */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Panier et commandes */}
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Profil utilisateur */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ProductManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <OrderManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <UserManager />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;


import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/SignUp";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantManagement from "./pages/RestaurantManagement";
import RestaurantViewEdit from "./pages/RestaurantViewEdit";
import RestaurantAdd from "./pages/RestaurantAdd";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SuccessPage from "./pages/SuccesPage";
import UserBookingStatus from "./pages/UserBookingStatus";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/restaurant/:restaurantId/manage" element={<RestaurantManagement />} />
              <Route path="/restaurant/:id/view-edit" element={<RestaurantViewEdit />} />
              <Route path="/restaurant/add" element={<RestaurantAdd />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="/userbookingstatus" element={<UserBookingStatus />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;

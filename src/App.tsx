import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RouteSeo } from "@/components/RouteSeo";
import MainLayout from "./layouts/MainLayout.tsx";
import Home from "./pages/Home.tsx";
import DestinationsPage from "./pages/DestinationsPage.tsx";
import AssistantPage from "./pages/AssistantPage.tsx";
import CartePage from "./pages/CartePage.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import SuggestionDetailPage from "./pages/SuggestionDetailPage.tsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteSeo />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/carte" element={<CartePage />} />
                <Route path="/decouverte" element={<SuggestionDetailPage />} />
                <Route path="/destination/:slug" element={<DestinationDetailPage />} />
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

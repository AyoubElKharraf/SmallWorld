import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RouteSeo } from "@/components/RouteSeo";
import { PageLoader } from "@/components/PageLoader";
import MainLayout from "./layouts/MainLayout.tsx";

const Home = lazy(() => import("./pages/Home.tsx"));
const DestinationsPage = lazy(() => import("./pages/DestinationsPage.tsx"));
const AssistantPage = lazy(() => import("./pages/AssistantPage.tsx"));
const CartePage = lazy(() => import("./pages/CartePage.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const SuggestionDetailPage = lazy(() => import("./pages/SuggestionDetailPage.tsx"));
const DestinationDetailPage = lazy(() => import("./pages/DestinationDetailPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.tsx"));

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
            <Suspense fallback={<PageLoader />}>
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
                  <Route
                    path="/favoris"
                    element={
                      <ProtectedRoute>
                        <FavoritesPage />
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

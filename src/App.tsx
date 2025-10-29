import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CustomModel from "./pages/CustomModel";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { syncAuthFromStorage } from "./store/slice/userslice";

const queryClient = new QueryClient();

const App = () => {
  const { isLoggedIn, authChecked, checkAuth } = useAuth();
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("App mounted, checking authentication...");

    // First sync auth state from localStorage
    dispatch(syncAuthFromStorage());

    // Then check authentication only once when app loads
    if (!authChecked) {
      console.log("Auth not checked yet, calling checkAuth...");
      checkAuth();
    } else {
      console.log("Auth already checked");
    }
  }, [authChecked, checkAuth, dispatch]);

  // Add this additional useEffect to handle page refresh
  useEffect(() => {
    const handlePageRefresh = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn && !authChecked) {
        console.log("Page refreshed, re-checking auth...");
        checkAuth();
      }
    };
    // Check on mount
    handlePageRefresh();

    // Listen for storage changes (in case of multiple tabs)
    window.addEventListener("storage", handlePageRefresh);

    return () => {
      window.removeEventListener("storage", handlePageRefresh);
    };
  }, [authChecked, checkAuth]);

  // Show loader while checking authentication
  if (!authChecked) {
    return <div>Loading...!!</div>;
  }

  return (
    // <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/share/:id" element={<Dashboard />} />
          <Route path="/dashboard/custom-model" element={<CustomModel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
    // </Provider>
  );
};

export default App;

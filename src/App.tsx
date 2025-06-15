import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Wrapper from "./pages/Wrapper";
import NotFound from "./pages/NotFound";
import Medications from "./pages/Medications";
import ViewList from "./pages/ViewList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <Wrapper>
                <Index />
              </Wrapper>
            }
          />
          <Route path="/medications" element={<Medications />} />
          <Route path="/view-list" element={<ViewList />} />

          <Route
            path="*"
            element={
              <Wrapper>
                <NotFound />
              </Wrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
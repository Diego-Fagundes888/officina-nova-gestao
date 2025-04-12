
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ServiceOrders from "./pages/ServiceOrders";
import CreateServiceOrder from "./pages/CreateServiceOrder";
import ServiceOrderDetail from "./pages/ServiceOrderDetail";
import History from "./pages/History";
import Financial from "./pages/Financial";
import Inventory from "./pages/Inventory";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ordens" element={<ServiceOrders />} />
              <Route path="/ordens/nova" element={<CreateServiceOrder />} />
              <Route path="/ordens/:id" element={<ServiceOrderDetail />} />
              <Route path="/ordens/editar/:id" element={<CreateServiceOrder />} />
              <Route path="/historico" element={<History />} />
              <Route path="/financeiro" element={<Financial />} />
              <Route path="/pecas" element={<Inventory />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Processos from "./pages/Processos";
import Admin from "./pages/Admin";
import Calendario from "./pages/Calendario";
import Perfil from "./pages/Perfil";
import RecuperarSenha from "./pages/RecuperarSenha";
import StatusProtocolo from "./pages/StatusProtocolo";
import { useAuth } from "./_core/hooks/useAuth";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, FileText, LogOut, Menu, Settings, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DM_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663557675120/4ytvUVEtgZpREdobsNfbUD/dm-logo_b3d99471.jpg";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img src={DM_LOGO} alt="DM" className="w-10 h-10 rounded-full" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold truncate">DM Gestão</h1>
                <p className="text-xs text-slate-400 truncate">Protocolos</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            href="/"
            open={sidebarOpen}
            onClick={() => navigate("/")}
          />
          <NavItem
            icon={Users}
            label="Clientes"
            href="/clientes"
            open={sidebarOpen}
            onClick={() => navigate("/clientes")}
          />
          <NavItem
            icon={FileText}
            label="Processos"
            href="/processos"
            open={sidebarOpen}
            onClick={() => navigate("/processos")}
          />
          <NavItem
            icon={FileText}
            label="Status Protocolo"
            href="/status-protocolo"
            open={sidebarOpen}
            onClick={() => navigate("/status-protocolo")}
          />
          <NavItem
            icon={Calendar}
            label="Calendário"
            href="/calendario"
            open={sidebarOpen}
            onClick={() => navigate("/calendario")}
          />
          <NavItem
            icon={User}
            label="Meu Perfil"
            href="/perfil"
            open={sidebarOpen}
            onClick={() => navigate("/perfil")}
          />
          {user?.role === "admin" && (
            <NavItem
              icon={Settings}
              label="Admin"
              href="/admin"
              open={sidebarOpen}
              onClick={() => navigate("/admin")}
            />
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {sidebarOpen && (
            <div className="text-xs text-slate-400 truncate">
              <p className="font-semibold text-slate-200">{user?.name}</p>
              <p>{user?.username}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-slate-700 hover:bg-slate-600 rounded-full p-1 text-white"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">DM Gestão de Protocolos</h2>
            <div className="text-sm text-slate-600">
              Bem-vindo, <span className="font-semibold">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  open: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, href, open, onClick }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {open && <span className="text-sm font-medium truncate">{label}</span>}
    </button>
  );
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/recuperar-senha" component={RecuperarSenha} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <ProtectedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/processos" component={Processos} />
        <Route path="/status-protocolo" component={StatusProtocolo} />
        <Route path="/calendario" component={Calendario} />
        <Route path="/perfil" component={Perfil} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;


import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  Calendar, 
  PieChart, 
  Package, 
  Menu, 
  X 
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ordens de Serviço', href: '/ordens', icon: FileText },
  { name: 'Histórico', href: '/historico', icon: Clock },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Financeiro', href: '/financeiro', icon: PieChart },
  { name: 'Peças', href: '/pecas', icon: Package },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-secondary text-primary-foreground"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar for mobile (off-canvas) */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-sm transition-all duration-300", 
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border overflow-y-auto p-6 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Officina Nova</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-secondary"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-64 lg:bg-card lg:border-r lg:border-border">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h2 className="text-2xl font-bold">Officina Nova</h2>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

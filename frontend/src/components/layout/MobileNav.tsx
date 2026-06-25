import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Wallet, Droplet, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: BarChart2, label: 'Markets', path: '/markets' },
    { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
    { icon: Droplet, label: 'Liquidity', path: '/liquidity' },
    { icon: ArrowRightLeft, label: 'Trade', path: '/market/ststx-mar2027' },
  ];

  return (
    <nav className="md:hidden glass-panel border-t border-border-subtle fixed bottom-0 w-full z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center py-2 px-4 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-150",
                isActive 
                  ? "bg-primary-container text-on-primary-container scale-90" 
                  : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wider uppercase leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

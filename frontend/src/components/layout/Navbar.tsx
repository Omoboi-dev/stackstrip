import { Bitcoin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useWallet } from '../../lib/wallet';

const short = (a: string) => `${a.slice(0, 5)}...${a.slice(-4)}`;

export function Navbar() {
  const location = useLocation();
  const { address, connected, connecting, connectWallet, disconnectWallet } = useWallet();

  const links = [
    { name: 'Markets', href: '/markets' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Liquidity', href: '/liquidity' },
    { name: 'Trade', href: '/market/ststx-mar2027' },
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-border-subtle shadow-lg shadow-black/40">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Bitcoin className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic text-on-background">STACKSTRIP<span className="text-primary">.</span></span>
        </Link>
        
        <nav className="hidden md:flex gap-10 items-center">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.href) && link.href !== '/' || location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-label-sm transition-opacity duration-200 relative",
                  isActive 
                    ? "opacity-100 text-on-background" 
                    : "opacity-60 text-on-background hover:opacity-100"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center">
          {connected && address ? (
            <button
              onClick={disconnectWallet}
              title="Click to disconnect"
              className="border border-primary/40 bg-primary/10 text-primary text-label-sm px-5 py-2 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {short(address)}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="border border-outline hover:bg-on-background hover:text-background text-label-sm px-6 py-2 rounded-full transition-all active:scale-95 flex items-center justify-center disabled:opacity-60"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

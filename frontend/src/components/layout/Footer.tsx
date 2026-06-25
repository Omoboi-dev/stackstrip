import { Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-white/5 w-full py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-end gap-stack-md mt-auto pb-24 md:pb-8">
      <div className="flex gap-16 w-full md:w-auto justify-between md:justify-start">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest opacity-40 text-on-background">Block Height</span>
          <span className="text-xs font-mono text-on-background">842,109</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest opacity-40 text-on-background">Status</span>
          <span className="text-xs font-mono text-on-background flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Protocol Active
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-end gap-4 mt-6 md:mt-0">
        <div className="flex flex-wrap justify-center md:justify-end gap-6 mb-2">
          {['Documentation', 'Governance', 'Security', 'Terms'].map((link) => (
            <Link key={link} to="#" className="text-[9px] uppercase tracking-[0.2em] opacity-40 text-on-background hover:opacity-100 transition-opacity font-bold">
              {link}
            </Link>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-background">© 2026 Stackstrip</p>
      </div>
    </footer>
  );
}

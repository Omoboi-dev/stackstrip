/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { Landing } from './pages/Landing';
import { Markets } from './pages/Markets';
import { MarketDetail } from './pages/MarketDetail';
import { Portfolio } from './pages/Portfolio';
import { Liquidity } from './pages/Liquidity';
import { WalletProvider } from './lib/wallet';

export default function App() {
  return (
    <WalletProvider>
    <Router>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-indigo-900/20 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-150px] right-[-50px] w-[600px] h-[600px] bg-gradient-to-tl from-purple-900/30 to-transparent rounded-full blur-[150px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/liquidity" element={<Liquidity />} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
        </div>
      </div>
    </Router>
    </WalletProvider>
  );
}

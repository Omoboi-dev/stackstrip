import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShaderBackground } from '../components/ShaderBackground';
import { CountUp } from '../components/ui/CountUp';
import { getReserves, getMarketInfo } from '../lib/stacks';

export function Landing() {
  const [stats, setStats] = useState({ tvl: 0, ptPrice: 0 });
  useEffect(() => {
    (async () => {
      try {
        const r = await getReserves();
        await getMarketInfo();
        setStats({ tvl: r.base + r.pt, ptPrice: r.pt > 0 ? r.base / r.pt : 0 });
      } catch {
        // non-fatal
      }
    })();
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-margin-mobile md:px-margin-desktop py-stack-lg overflow-hidden">
        <ShaderBackground />
        
        <motion.div 
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-stack-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container bg-surface-container/50 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-label-sm text-secondary">Live on Stacks Testnet</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-display-lg text-on-background max-w-4xl">
            Fixed income for <span className="text-primary">Bitcoin.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-body-md text-on-surface-variant max-w-2xl text-lg md:text-xl mb-6">
            The first fixed-income market for Bitcoin, built on Stacks. Separate your yield from your principal and hedge against volatility.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
            <Link to="/markets" className="border border-outline hover:bg-on-background hover:text-background text-label-sm px-8 py-4 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
              Launch App
            </Link>
            <Link to="/markets" className="border border-outline-variant text-on-surface hover:border-primary hover:text-primary hover:bg-primary-container/5 text-label-sm px-8 py-4 rounded-full transition-colors flex items-center justify-center">
              View Markets
            </Link>
          </motion.div>
        </motion.div>
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Live Stats Strip */}
      <section className="border-y border-outline-variant/30 bg-surface-container-low py-8 relative z-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-start"
            >
              <span className="text-label-sm text-on-surface-variant mb-2">Total Value Locked</span>
              <div className="text-data-lg text-on-surface flex items-baseline gap-1">
                <CountUp end={stats.tvl} decimals={2} suffix=" tok" />
              </div>
            </motion.div>
            
            <div className="hidden md:block w-px h-12 bg-outline-variant/50"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center md:items-start"
            >
              <span className="text-label-sm text-on-surface-variant mb-2">Active Markets</span>
              <div className="text-data-lg text-on-surface">
                <CountUp end={1} />
              </div>
            </motion.div>
            
            <div className="hidden md:block w-px h-12 bg-outline-variant/50"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center md:items-start"
            >
              <span className="text-label-sm text-on-surface-variant mb-2">PT Price</span>
              <div className="text-data-lg text-secondary flex items-baseline gap-1">
                <CountUp end={stats.ptPrice} decimals={4} suffix=" stSTX" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-headline-md text-on-background mb-4">Mastering Yield Separation</h2>
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Stackstrip decomposes interest-bearing assets into two distinct tradable tokens, empowering tailored risk strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* PT Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-border-subtle group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary font-variation-[FILL_1]">account_balance</span>
              </div>
              <h3 className="text-headline-md text-on-background">Principal Tokens (PT)</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-8 min-h-[72px]">
              Represents the underlying asset, redeemable 1:1 at maturity. Secure fixed yields by purchasing PTs at a discount, ideal for risk-averse holders seeking predictable returns.
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-subtle flex justify-between items-center">
              <span className="text-label-sm text-on-surface">Target Strategy:</span>
              <span className="text-label-sm text-primary">Fixed Income</span>
            </div>
          </motion.div>

          {/* YT Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-border-subtle group-hover:bg-secondary-container transition-colors">
                <span className="material-symbols-outlined text-secondary font-variation-[FILL_1]">trending_up</span>
              </div>
              <h3 className="text-headline-md text-on-background">Yield Tokens (YT)</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-8 min-h-[72px]">
              Represents the right to receive all future yield generated by the underlying asset until maturity. Speculate on rising rates or hedge borrowing costs efficiently.
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-border-subtle flex justify-between items-center">
              <span className="text-label-sm text-on-surface">Target Strategy:</span>
              <span className="text-label-sm text-secondary">Rate Speculation</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

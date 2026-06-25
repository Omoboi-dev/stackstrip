import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Bitcoin } from 'lucide-react';
import { CountUp } from '../components/ui/CountUp';

export function Markets() {
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
      transition: { duration: 0.4 }
    }
  };

  const markets = [
    { id: 'ststx-mar2027', name: 'stSTX-MAR2027', type: 'Active', days: 789, fixedApy: 7.82, underlyingApy: 4.15, tvl: 45.2, liquidity: 2.1 },
    { id: 'ststx-jun2027', name: 'stSTX-JUN2027', type: 'Active', days: 880, fixedApy: 8.15, underlyingApy: 4.15, tvl: 62.8, liquidity: 4.5 },
    { id: 'ststx-sep2027', name: 'stSTX-SEP2027', type: 'New', days: 972, fixedApy: 9.40, underlyingApy: 4.15, tvl: 12.4, liquidity: 1.2 },
    { id: 'sbtc-dec2024', name: 'Dec \'24 BTC', type: 'Active', days: 86, fixedApy: 4.25, underlyingApy: 4.10, tvl: 1204.5, liquidity: 320.1 },
    { id: 'sbtc-mar2025', name: 'Mar \'25 BTC', type: 'Active', days: 176, fixedApy: 5.10, underlyingApy: 4.85, tvl: 850.2, liquidity: 150.8 },
  ];

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <motion.div 
        className="mb-stack-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-display-lg text-on-background mb-2">Yield Markets</h1>
          <p className="text-body-md text-on-surface-variant">Institutional grade fixed-income strategies on Bitcoin.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="w-full bg-surface-container text-on-surface pl-10 pr-4 py-2 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg border border-border-subtle bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.section 
        className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stat Card 1 */}
        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            Total TVL
          </h3>
          <div className="text-data-lg text-on-background">
            <CountUp prefix="$" end={245.8} decimals={1} suffix="M" />
          </div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors duration-500"></div>
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Avg Fixed APY
          </h3>
          <div className="text-data-lg text-primary">
            <CountUp end={8.45} decimals={2} suffix="%" />
          </div>
        </motion.div>

        {/* Stat Card 3 */}
        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            Total Vol (24h)
          </h3>
          <div className="text-data-lg text-on-background">
            <CountUp prefix="$" end={12.3} decimals={1} suffix="M" />
          </div>
        </motion.div>
      </motion.section>

      {/* Filters */}
      <motion.section 
        className="flex overflow-x-auto gap-2 mb-stack-md border-b border-border-subtle pb-2 no-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-label-sm whitespace-nowrap">
          All Markets
        </button>
        <button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-label-sm whitespace-nowrap transition-colors">
          Short Term
        </button>
        <button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-label-sm whitespace-nowrap transition-colors">
          Long Term
        </button>
      </motion.section>

      {/* Markets List */}
      <motion.div 
        className="hidden md:block bg-surface-container rounded-xl border border-border-subtle overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-high">
              <th className="py-4 px-6 text-label-sm text-on-surface-variant">Market</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Days Left</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Fixed APY</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Underlying APY</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">TVL (M)</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {markets.map((market) => (
              <tr key={market.id} className="hover:bg-surface-variant/30 transition-colors group">
                <td className="py-3 px-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-subtle">
                    <Bitcoin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-body-md font-semibold flex items-center gap-2">
                      {market.name}
                      {market.type === 'New' && <span className="px-2 py-0.5 rounded text-[10px] bg-surface-container text-on-surface-variant border border-border-subtle uppercase">NEW</span>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-6 text-data-md text-on-surface-variant text-right">{market.days}</td>
                <td className="py-3 px-6 text-data-md text-right">
                  <span className="text-primary font-bold">{market.fixedApy.toFixed(2)}%</span>
                </td>
                <td className="py-3 px-6 text-data-md text-on-surface-variant text-right">{market.underlyingApy.toFixed(2)}%</td>
                <td className="py-3 px-6 text-data-md text-right">{market.tvl}</td>
                <td className="py-3 px-6 text-center">
                  <Link to={`/market/${market.id}`} className="px-4 py-2 rounded-lg text-label-sm font-bold border border-border-subtle hover:border-primary hover:text-primary transition-all inline-block">
                    Trade
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Mobile Card View */}
      <motion.div 
        className="md:hidden flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {markets.map((market) => (
          <motion.div key={market.id} variants={itemVariants} className="glass-card p-5">
            <div className="flex justify-between items-start mb-4 border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-headline-md text-[18px] flex items-center gap-2">
                  {market.name}
                </h2>
                <div className="text-label-sm text-on-surface-variant mt-1">
                  {market.days} Days Left
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-label-sm text-on-surface-variant mb-1">Fixed APY</div>
                <div className="text-data-lg text-primary">{market.fixedApy.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-label-sm text-on-surface-variant mb-1">Underlying APY</div>
                <div className="text-data-md">{market.underlyingApy.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-label-sm text-on-surface-variant mb-1">TVL</div>
                <div className="text-data-md">{market.tvl}M</div>
              </div>
            </div>
            
            <Link to={`/market/${market.id}`} className="w-full py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-sm font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2">
              Trade <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

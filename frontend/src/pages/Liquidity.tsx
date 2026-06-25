import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { CountUp } from '../components/ui/CountUp';

export function Liquidity() {
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

  const pools = [
    {
      name: 'stSTX-MAR2027 LP',
      type: 'Stable',
      fee: '0.05%',
      yourLiquidity: 2500.00,
      poolTvl: 12.4,
      feeApr: 12.5,
    },
    {
      name: 'sBTC-DEC2026 LP',
      type: 'Volatile',
      fee: '0.3%',
      yourLiquidity: 2500.00,
      poolTvl: 8.2,
      feeApr: 8.2,
    }
  ];

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg pb-32">
      {/* Header & Stats */}
      <div className="mb-stack-lg">
        <motion.h1 
          className="text-display-lg text-on-background mb-stack-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Liquidity Provision
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-gutter"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stat Card 1 */}
          <motion.div variants={itemVariants} className="glass-card p-6 shadow-lg">
            <h3 className="text-label-sm text-on-surface-variant mb-2">Your Liquidity</h3>
            <div className="text-display-lg-mobile md:text-[32px] text-primary" style={{ textShadow: '0 0 12px rgba(255, 184, 116, 0.3)' }}>
              <CountUp prefix="$" end={5000.00} decimals={2} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-secondary-container/20 text-secondary border border-secondary/20 text-data-md px-2 py-0.5 rounded-full text-xs flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +2.4%
              </span>
              <span className="text-body-md text-on-surface-variant text-sm">vs last week</span>
            </div>
          </motion.div>

          {/* Stat Card 2 */}
          <motion.div variants={itemVariants} className="glass-card p-6 shadow-lg">
            <h3 className="text-label-sm text-on-surface-variant mb-2">Total Fees Earned</h3>
            <div className="text-display-lg-mobile md:text-[32px] text-on-background">
              <CountUp prefix="$" end={125.40} decimals={2} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 md:justify-between">
              <span className="text-data-md text-on-surface-variant text-sm border border-border-subtle px-2 py-0.5 rounded">
                Claimable: $42.10
              </span>
              <button className="text-primary text-label-sm hover:underline ml-auto md:ml-0">Claim All</button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Active Pools */}
      <motion.div 
        className="mb-stack-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-headline-md text-on-background mb-stack-md border-b border-border-subtle pb-2">Active Pools</h2>
        
        <div className="flex flex-col gap-4">
          {pools.map((pool, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card p-6 group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-border-subtle">
                    <Droplet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-headline-md text-lg text-on-background">{pool.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-surface-container text-on-surface-variant text-label-sm px-2 py-0.5 rounded border border-border-subtle">
                        {pool.type}
                      </span>
                      <span className="text-body-md text-on-surface-variant text-sm">Fee: {pool.fee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8 w-full md:w-auto">
                  <div>
                    <div className="text-label-sm text-on-surface-variant mb-1">Your Liquidity</div>
                    <div className="text-data-md text-on-background">${pool.yourLiquidity.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-label-sm text-on-surface-variant mb-1">Pool TVL</div>
                    <div className="text-data-md text-on-background">${pool.poolTvl}M</div>
                  </div>
                  <div>
                    <div className="text-label-sm text-on-surface-variant mb-1">Fee APR</div>
                    <div className="text-data-md text-secondary">{pool.feeApr}%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-border-subtle md:border-t-0">
                  <button className="flex-1 md:flex-none border border-border-subtle text-on-background text-label-sm px-6 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors">
                    Remove
                  </button>
                  <button className="flex-1 md:flex-none bg-primary/10 border border-primary/20 text-primary text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary hover:text-on-primary transition-colors">
                    Add
                  </button>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

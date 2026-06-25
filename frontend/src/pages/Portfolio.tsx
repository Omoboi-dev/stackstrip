import { motion } from 'framer-motion';
import { Bitcoin, Wallet, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CountUp } from '../components/ui/CountUp';

const pieData = [
  { name: 'PT', value: 65, color: 'var(--color-primary)' },
  { name: 'YT', value: 35, color: 'var(--color-secondary)' },
];

export function Portfolio() {
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

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg pb-32">
      <div className="mb-stack-lg">
        <motion.h1 
          className="text-display-lg text-on-background mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Portfolio Overview
        </motion.h1>
        <motion.p 
          className="text-body-md text-on-surface-variant"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Manage your institutional-grade yield strategies.
        </motion.p>
      </div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Stats Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Total Net Value */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <h2 className="text-label-sm text-on-surface-variant">Total Net Value</h2>
              <Wallet className="w-5 h-5 text-outline-variant" />
            </div>
            <div>
              <div className="text-display-lg-mobile md:text-[40px] text-primary mt-4 font-mono font-medium tracking-tight">
                <CountUp prefix="$" end={12450.00} decimals={2} />
              </div>
              <div className="text-data-md text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +2.4% (24h)
              </div>
            </div>
          </motion.div>

          {/* Projected Yield */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <h2 className="text-label-sm text-on-surface-variant">Est. Projected Yield</h2>
              <Zap className="w-5 h-5 text-outline-variant" />
            </div>
            <div>
              <div className="text-display-lg-mobile md:text-[40px] text-on-background mt-4 font-mono font-medium tracking-tight">
                <CountUp prefix="+$" end={420.00} decimals={2} />
              </div>
              <div className="text-data-md text-on-surface-variant mt-1">Based on current active positions</div>
            </div>
          </motion.div>

          {/* PT Holdings */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <h2 className="text-label-sm text-on-surface-variant">Principal Tokens (PT)</h2>
            </div>
            <div className="text-data-lg text-on-background">
              <CountUp prefix="$" end={8200.00} decimals={2} />
            </div>
            <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '65%' }}></div>
            </div>
          </motion.div>

          {/* YT Holdings */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <h2 className="text-label-sm text-on-surface-variant">Yield Tokens (YT)</h2>
            </div>
            <div className="text-data-lg text-on-background">
              <CountUp prefix="$" end={4250.00} decimals={2} />
            </div>
            <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-secondary h-full" style={{ width: '35%' }}></div>
            </div>
          </motion.div>
        </div>

        {/* Right Asset Allocation Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-4 glass-card p-6 flex flex-col items-center justify-center min-h-[300px] relative">
          <h2 className="text-label-sm text-on-surface-variant w-full text-left mb-6">Asset Allocation</h2>
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  stroke="none"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-data-md text-on-surface-variant">Total</span>
              <span className="text-data-lg text-on-background">2</span>
              <span className="text-label-sm text-outline">Assets</span>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-data-md text-on-surface-variant">PT 65%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <span className="text-data-md text-on-surface-variant">YT 35%</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Active Positions */}
      <motion.div 
        className="mb-stack-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-headline-md text-on-background">Active Positions</h2>
          <div className="flex gap-2">
            <button className="text-label-sm text-primary px-3 py-1 bg-primary/10 rounded">All</button>
            <button className="text-label-sm text-on-surface-variant px-3 py-1 hover:text-primary transition-colors">PT</button>
            <button className="text-label-sm text-on-surface-variant px-3 py-1 hover:text-primary transition-colors">YT</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-2 border-b border-border-subtle">
            <div className="col-span-3 text-label-sm text-on-surface-variant">Market</div>
            <div className="col-span-2 text-label-sm text-on-surface-variant">Type</div>
            <div className="col-span-2 text-label-sm text-on-surface-variant text-right">Amount</div>
            <div className="col-span-2 text-label-sm text-on-surface-variant text-right">Maturity</div>
            <div className="col-span-2 text-label-sm text-on-surface-variant text-center">Status</div>
            <div className="col-span-1 text-label-sm text-on-surface-variant text-right">Action</div>
          </div>

          {/* Position 1 */}
          <motion.div variants={itemVariants} className="glass-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
            <div className="md:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border-subtle">
                <Bitcoin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-body-md font-semibold text-on-background">sBTC-24DEC</div>
                <div className="text-label-sm text-on-surface-variant mt-1">Stacks Bitcoin</div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center border-t md:border-t-0 border-border-subtle pt-3 md:pt-0 mt-3 md:mt-0">
              <span className="md:hidden text-label-sm text-on-surface-variant">Type</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-data-md text-on-background">PT</span>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-right">
              <span className="md:hidden text-label-sm text-on-surface-variant">Amount</span>
              <div>
                <div className="text-data-md text-on-background">2.4500 sBTC</div>
                <div className="text-data-md text-[12px] text-on-surface-variant mt-0.5">~$145,200</div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-right">
              <span className="md:hidden text-label-sm text-on-surface-variant">Maturity</span>
              <div className="text-data-md text-on-background">24 Dec 2024</div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-center">
              <span className="md:hidden text-label-sm text-on-surface-variant">Status</span>
              <span className="bg-secondary-container text-secondary border border-secondary/20 text-label-sm px-2.5 py-1 rounded-full">Active</span>
            </div>
            
            <div className="md:col-span-1 flex justify-end mt-4 md:mt-0">
              <button className="w-full md:w-auto text-label-sm border border-border-subtle text-on-background hover:border-primary hover:text-primary px-4 py-2 rounded transition-colors">
                Manage
              </button>
            </div>
          </motion.div>

          {/* Position 2 */}
          <motion.div variants={itemVariants} className="glass-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
            <div className="md:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border-subtle">
                <span className="material-symbols-outlined text-secondary">toll</span>
              </div>
              <div>
                <div className="text-body-md font-semibold text-on-background">stSTX-30SEP</div>
                <div className="text-label-sm text-on-surface-variant mt-1">Stacked STX</div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center border-t md:border-t-0 border-border-subtle pt-3 md:pt-0 mt-3 md:mt-0">
              <span className="md:hidden text-label-sm text-on-surface-variant">Type</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="text-data-md text-on-background">YT</span>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-right">
              <span className="md:hidden text-label-sm text-on-surface-variant">Amount</span>
              <div>
                <div className="text-data-md text-on-background">15,000 stSTX</div>
                <div className="text-data-md text-[12px] text-on-surface-variant mt-0.5">~$24,500</div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-right">
              <span className="md:hidden text-label-sm text-on-surface-variant">Maturity</span>
              <div className="text-data-md text-on-background">30 Sep 2024</div>
            </div>
            
            <div className="md:col-span-2 flex md:block justify-between items-center md:text-center">
              <span className="md:hidden text-label-sm text-on-surface-variant">Status</span>
              <span className="bg-surface-variant text-on-surface-variant border border-border-subtle text-label-sm px-2.5 py-1 rounded-full">Matured</span>
            </div>
            
            <div className="md:col-span-1 flex justify-end mt-4 md:mt-0">
              <button className="w-full md:w-auto text-label-sm border border-border-subtle text-on-background hover:border-primary hover:text-primary px-4 py-2 rounded transition-colors">
                Claim
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

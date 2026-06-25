import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Bitcoin } from 'lucide-react';
import { CountUp } from '../components/ui/CountUp';
import { getReserves, getMarketInfo } from '../lib/stacks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export function Markets() {
  const [reserves, setReserves] = useState({ base: 0, pt: 0 });
  const [market, setMarket] = useState({ maturity: 0, exchangeRate: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [r, info] = await Promise.all([getReserves(), getMarketInfo()]);
        setReserves({ base: r.base, pt: r.pt });
        setMarket({ maturity: info.maturity, exchangeRate: info.exchangeRate });
      } catch {
        // non-fatal
      }
    })();
  }, []);

  const tvl = reserves.base + reserves.pt;
  const ptPrice = reserves.pt > 0 ? reserves.base / reserves.pt : 0;
  const rate = market.exchangeRate ? market.exchangeRate / 1e8 : 1;

  const markets = [
    {
      id: 'ststx',
      name: 'stSTX Yield Market',
      type: 'Live',
      maturity: market.maturity ? `Block ${market.maturity.toLocaleString()}` : '-',
      ptPrice,
      rate,
      tvl,
    },
  ];

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <motion.div className="mb-stack-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-display-lg text-on-background mb-2">Yield Markets</h1>
          <p className="text-body-md text-on-surface-variant">Fixed income for Bitcoin, live on Stacks testnet.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input type="text" placeholder="Search markets..." className="w-full bg-surface-container text-on-surface pl-10 pr-4 py-2 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg border border-border-subtle bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            Pool TVL
          </h3>
          <div className="text-data-lg text-on-background"><CountUp end={tvl} decimals={2} suffix=" tok" /></div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors duration-500"></div>
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">sell</span>
            PT Price
          </h3>
          <div className="text-data-lg text-primary"><CountUp end={ptPrice} decimals={4} suffix=" stSTX" /></div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
          <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">tag</span>
            Live Markets
          </h3>
          <div className="text-data-lg text-on-background"><CountUp end={1} decimals={0} /></div>
        </motion.div>
      </motion.section>

      <motion.div className="hidden md:block bg-surface-container rounded-xl border border-border-subtle overflow-hidden shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-high">
              <th className="py-4 px-6 text-label-sm text-on-surface-variant">Market</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Maturity</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">PT Price</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Exch. Rate</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-right">Pool TVL</th>
              <th className="py-4 px-6 text-label-sm text-on-surface-variant text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {markets.map((m) => (
              <tr key={m.id} className="hover:bg-surface-variant/30 transition-colors group">
                <td className="py-3 px-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-subtle">
                    <Bitcoin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-body-md font-semibold flex items-center gap-2">
                    {m.name}
                    <span className="px-2 py-0.5 rounded text-[10px] bg-secondary/10 text-secondary border border-secondary/30 uppercase">{m.type}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-data-md text-on-surface-variant text-right">{m.maturity}</td>
                <td className="py-3 px-6 text-data-md text-right"><span className="text-primary font-bold">{fmt(m.ptPrice)}</span></td>
                <td className="py-3 px-6 text-data-md text-on-surface-variant text-right">{m.rate.toFixed(4)}</td>
                <td className="py-3 px-6 text-data-md text-right">{fmt(m.tvl)}</td>
                <td className="py-3 px-6 text-center">
                  <Link to={`/market/${m.id}`} className="px-4 py-2 rounded-lg text-label-sm font-bold border border-border-subtle hover:border-primary hover:text-primary transition-all inline-block">Trade</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div className="md:hidden flex flex-col gap-4" variants={containerVariants} initial="hidden" animate="visible">
        {markets.map((m) => (
          <motion.div key={m.id} variants={itemVariants} className="glass-card p-5">
            <div className="flex justify-between items-start mb-4 border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-headline-md text-[18px] flex items-center gap-2">{m.name}</h2>
                <div className="text-label-sm text-on-surface-variant mt-1">{m.maturity}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-label-sm text-on-surface-variant mb-1">PT Price</div>
                <div className="text-data-lg text-primary">{fmt(m.ptPrice)} stSTX</div>
              </div>
              <div>
                <div className="text-label-sm text-on-surface-variant mb-1">Pool TVL</div>
                <div className="text-data-md">{fmt(m.tvl)} tok</div>
              </div>
            </div>
            <Link to={`/market/${m.id}`} className="w-full py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-sm font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2">
              Trade <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bitcoin, Wallet, Zap, Coins, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CountUp } from '../components/ui/CountUp';
import { useWallet } from '../lib/wallet';
import { getBalance, getMarketInfo, getRecentActivity, explorerTx, type Activity } from '../lib/stacks';

const fnLabel: Record<string, string> = {
  mint: 'Faucet', deposit: 'Split', 'swap-base-for-pt': 'Buy PT', 'swap-pt-for-base': 'Sell PT',
  'add-liquidity': 'Add Liquidity', 'remove-liquidity': 'Remove Liquidity', settle: 'Settle',
  'redeem-pt': 'Redeem PT', 'redeem-yt': 'Redeem YT',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Portfolio() {
  const { address, connected, connectWallet } = useWallet();
  const [bal, setBal] = useState({ base: 0, pt: 0, yt: 0 });
  const [market, setMarket] = useState({ maturity: 0, settled: false });
  const [activity, setActivity] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    const info = await getMarketInfo();
    setMarket({ maturity: info.maturity, settled: info.settled });
    if (!address) return;
    const [base, pt, yt, acts] = await Promise.all([
      getBalance('mockStstx', address),
      getBalance('pt', address),
      getBalance('yt', address),
      getRecentActivity(address),
    ]);
    setBal({ base, pt, yt });
    setActivity(acts);
  }, [address]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const splitTotal = bal.pt + bal.yt;
  const ptPct = splitTotal > 0 ? Math.round((bal.pt / splitTotal) * 100) : 0;
  const ytPct = splitTotal > 0 ? 100 - ptPct : 0;
  const pieData = [
    { name: 'PT', value: bal.pt || 0.0001, color: 'var(--color-primary)' },
    { name: 'YT', value: bal.yt || 0.0001, color: 'var(--color-secondary)' },
  ];
  const status = market.settled ? 'Matured' : 'Active';
  const maturityLabel = market.maturity ? `Block ${market.maturity.toLocaleString()}` : '-';
  const hasPositions = bal.pt > 0 || bal.yt > 0;

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg pb-32">
      <div className="mb-stack-lg flex justify-between items-end gap-4 flex-wrap">
        <div>
          <motion.h1 className="text-display-lg text-on-background mb-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Portfolio Overview
          </motion.h1>
          <motion.p className="text-body-md text-on-surface-variant" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Your live positions on Stacks testnet.
          </motion.p>
        </div>
      </div>

      {!connected ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
          <Wallet className="w-10 h-10 text-outline-variant" />
          <p className="text-body-md text-on-surface-variant">Connect your wallet to see your positions.</p>
          <button onClick={connectWallet} className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-label-sm">
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg" variants={containerVariants} initial="hidden" animate="visible">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <h2 className="text-label-sm text-on-surface-variant">Available stSTX</h2>
                  <Coins className="w-5 h-5 text-outline-variant" />
                </div>
                <div className="text-display-lg-mobile md:text-[40px] text-on-background mt-4 font-mono font-medium tracking-tight">
                  <CountUp end={bal.base} decimals={2} />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <h2 className="text-label-sm text-on-surface-variant">Total Split Position</h2>
                  <Zap className="w-5 h-5 text-outline-variant" />
                </div>
                <div>
                  <div className="text-display-lg-mobile md:text-[40px] text-primary mt-4 font-mono font-medium tracking-tight">
                    <CountUp end={splitTotal} decimals={2} />
                  </div>
                  <div className="text-data-md text-on-surface-variant mt-1">PT + YT tokens held</div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <h2 className="text-label-sm text-on-surface-variant">Principal Tokens (PT)</h2>
                </div>
                <div className="text-data-lg text-on-background"><CountUp end={bal.pt} decimals={2} /></div>
                <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${ptPct}%` }}></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <h2 className="text-label-sm text-on-surface-variant">Yield Tokens (YT)</h2>
                </div>
                <div className="text-data-lg text-on-background"><CountUp end={bal.yt} decimals={2} /></div>
                <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: `${ytPct}%` }}></div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="lg:col-span-4 glass-card p-6 flex flex-col items-center justify-center min-h-[300px] relative">
              <h2 className="text-label-sm text-on-surface-variant w-full text-left mb-6">Asset Allocation</h2>
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }} itemStyle={{ fontFamily: 'var(--font-mono)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-data-md text-on-surface-variant">Split</span>
                  <span className="text-data-lg text-on-background">{splitTotal > 0 ? 2 : 0}</span>
                  <span className="text-label-sm text-outline">Assets</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-data-md text-on-surface-variant">PT {ptPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="text-data-md text-on-surface-variant">YT {ytPct}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="mb-stack-lg" variants={containerVariants} initial="hidden" animate="visible">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-headline-md text-on-background">Active Positions</h2>
            </div>

            {!hasPositions ? (
              <div className="glass-card p-10 text-center text-on-surface-variant">
                No positions yet. Head to a <Link to="/markets" className="text-primary">market</Link> to split or trade.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-2 border-b border-border-subtle">
                  <div className="col-span-4 text-label-sm text-on-surface-variant">Market</div>
                  <div className="col-span-2 text-label-sm text-on-surface-variant">Type</div>
                  <div className="col-span-3 text-label-sm text-on-surface-variant text-right">Amount</div>
                  <div className="col-span-2 text-label-sm text-on-surface-variant text-right">Maturity</div>
                  <div className="col-span-1 text-label-sm text-on-surface-variant text-center">Status</div>
                </div>

                {bal.pt > 0 && (
                  <PositionRow label="PT" name="stSTX Yield Market" sub="Principal Token" color="bg-primary" amount={bal.pt} unit="PT" maturity={maturityLabel} status={status} />
                )}
                {bal.yt > 0 && (
                  <PositionRow label="YT" name="stSTX Yield Market" sub="Yield Token" color="bg-secondary" amount={bal.yt} unit="YT" maturity={maturityLabel} status={status} />
                )}
              </div>
            )}
          </motion.div>

          <motion.div className="mb-stack-lg" variants={containerVariants} initial="hidden" animate="visible">
            <h2 className="text-headline-md text-on-background mb-6">Recent Activity</h2>
            {activity.length === 0 ? (
              <div className="glass-card p-8 text-center text-on-surface-variant text-sm">No transactions yet.</div>
            ) : (
              <div className="glass-card divide-y divide-border-subtle overflow-hidden">
                {activity.map((a) => (
                  <a
                    key={a.txid}
                    href={explorerTx(a.txid)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 p-4 hover:bg-surface-variant/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={a.status === 'success' ? 'text-secondary' : a.status === 'pending' ? 'text-on-surface-variant' : 'text-red-400'}>
                        {a.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : a.status === 'pending' ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                      <div>
                        <div className="text-body-md text-on-background">{fnLabel[a.fn] ?? a.fn}</div>
                        <div className="text-label-sm text-on-surface-variant">
                          {a.contract}{a.time ? ` · ${new Date(a.time * 1000).toLocaleString()}` : ''}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-on-surface-variant" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

function PositionRow({ name, sub, color, amount, unit, maturity, status }: {
  label: string; name: string; sub: string; color: string; amount: number; unit: string; maturity: string; status: string;
}) {
  return (
    <motion.div variants={itemVariants} className="glass-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border-subtle">
          <Bitcoin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-body-md font-semibold text-on-background">{name}</div>
          <div className="text-label-sm text-on-surface-variant mt-1">{sub}</div>
        </div>
      </div>
      <div className="md:col-span-2 flex md:block justify-between items-center border-t md:border-t-0 border-border-subtle pt-3 md:pt-0 mt-3 md:mt-0">
        <span className="md:hidden text-label-sm text-on-surface-variant">Type</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${color}`}></span>
          <span className="text-data-md text-on-background">{unit}</span>
        </div>
      </div>
      <div className="md:col-span-3 flex md:block justify-between items-center md:text-right">
        <span className="md:hidden text-label-sm text-on-surface-variant">Amount</span>
        <div className="text-data-md text-on-background">{amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}</div>
      </div>
      <div className="md:col-span-2 flex md:block justify-between items-center md:text-right">
        <span className="md:hidden text-label-sm text-on-surface-variant">Maturity</span>
        <div className="text-data-md text-on-background">{maturity}</div>
      </div>
      <div className="md:col-span-1 flex md:block justify-between items-center md:text-center">
        <span className="md:hidden text-label-sm text-on-surface-variant">Status</span>
        <span className={`text-label-sm px-2.5 py-1 rounded-full border ${status === 'Matured' ? 'bg-surface-variant text-on-surface-variant border-border-subtle' : 'bg-secondary-container text-secondary border-secondary/20'}`}>{status}</span>
      </div>
    </motion.div>
  );
}

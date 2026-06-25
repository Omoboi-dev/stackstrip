import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Loader2, ExternalLink } from 'lucide-react';
import { CountUp } from '../components/ui/CountUp';
import { useWallet } from '../lib/wallet';
import { getReserves, getLpShares, getTotalLp, addLiquidity, removeLiquidity, explorerTx } from '../lib/stacks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export function Liquidity() {
  const { address, connected, connectWallet } = useWallet();
  const [reserves, setReserves] = useState({ base: 0, pt: 0 });
  const [lp, setLp] = useState(0);
  const [totalLp, setTotalLp] = useState(0);
  const [addBase, setAddBase] = useState('100');
  const [removeLp, setRemoveLp] = useState('');
  const [busy, setBusy] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([getReserves(), getTotalLp()]);
    setReserves({ base: r.base, pt: r.pt });
    setTotalLp(t.lp);
    if (address) setLp(await getLpShares(address));
  }, [address]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError(null);
    setTxid(null);
    try {
      const res: any = await fn();
      setTxid(res?.txid ?? res?.txId ?? null);
      setTimeout(() => load().catch(() => {}), 8000);
    } catch (e: any) {
      setError(e?.message ?? 'Transaction cancelled');
    } finally {
      setBusy(false);
    }
  };

  const tvl = reserves.base + reserves.pt;
  const poolShare = totalLp > 0 ? (lp / totalLp) * 100 : 0;
  const ptPerBase = reserves.base > 0 ? reserves.pt / reserves.base : 1;

  const handleAdd = () => {
    if (!connected || !address) return connectWallet();
    const base = Number(addBase) || 0;
    const maxPt = Math.max(base * ptPerBase * 1.1, base); // buffer to cover the pulled PT
    return run(() => addLiquidity(address, base, maxPt));
  };
  const handleRemove = () => {
    if (!connected || !address) return connectWallet();
    return run(() => removeLiquidity(Number(removeLp) || 0));
  };

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg pb-32">
      <div className="mb-stack-lg">
        <motion.h1 className="text-display-lg text-on-background mb-stack-md" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Liquidity Provision
        </motion.h1>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-gutter" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="glass-card p-6 shadow-lg">
            <h3 className="text-label-sm text-on-surface-variant mb-2">Your Liquidity (LP)</h3>
            <div className="text-display-lg-mobile md:text-[32px] text-primary" style={{ textShadow: '0 0 12px rgba(255, 184, 116, 0.3)' }}>
              <CountUp end={lp} decimals={2} />
            </div>
            <div className="mt-4 text-body-md text-on-surface-variant text-sm">{fmt(poolShare)}% of the pool</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 shadow-lg">
            <h3 className="text-label-sm text-on-surface-variant mb-2">Pool TVL</h3>
            <div className="text-display-lg-mobile md:text-[32px] text-on-background">
              <CountUp end={tvl} decimals={2} suffix=" tok" />
            </div>
            <div className="mt-4 text-body-md text-on-surface-variant text-sm">{fmt(reserves.pt)} PT · {fmt(reserves.base)} stSTX</div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="mb-stack-lg" variants={containerVariants} initial="hidden" animate="visible">
        <h2 className="text-headline-md text-on-background mb-stack-md border-b border-border-subtle pb-2">PT / stSTX Pool</h2>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-border-subtle">
              <Droplet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md text-lg text-on-background">PT / stSTX</h3>
              <div className="text-body-md text-on-surface-variant text-sm">Constant-product pool · 0.3% fee</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Add */}
            <div className="bg-surface-container-lowest rounded-lg p-5 border border-border-subtle">
              <h4 className="text-label-sm text-on-surface-variant mb-3">Add Liquidity</h4>
              <div className="flex items-center justify-between bg-surface-container rounded-lg p-3 mb-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={addBase}
                  onChange={(e) => setAddBase(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="bg-transparent border-none outline-none text-data-lg text-on-surface w-full"
                  placeholder="0.00"
                />
                <span className="text-label-sm text-on-surface shrink-0">stSTX</span>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-3">
                Pairs with about {fmt((Number(addBase) || 0) * ptPerBase)} PT at the current ratio.
              </p>
              <button onClick={handleAdd} disabled={busy} className="w-full py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-label-sm hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {connected ? 'Add Liquidity' : 'Connect Wallet'}
              </button>
            </div>

            {/* Remove */}
            <div className="bg-surface-container-lowest rounded-lg p-5 border border-border-subtle">
              <h4 className="text-label-sm text-on-surface-variant mb-3">Remove Liquidity</h4>
              <div className="flex items-center justify-between bg-surface-container rounded-lg p-3 mb-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={removeLp}
                  onChange={(e) => setRemoveLp(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="bg-transparent border-none outline-none text-data-lg text-on-surface w-full"
                  placeholder="0.00"
                />
                <button onClick={() => setRemoveLp(String(lp))} className="text-[12px] text-secondary shrink-0">MAX</button>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-3">You have {fmt(lp)} LP tokens.</p>
              <button onClick={handleRemove} disabled={busy} className="w-full py-3 rounded-lg border border-border-subtle text-on-background text-label-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {connected ? 'Remove Liquidity' : 'Connect Wallet'}
              </button>
            </div>
          </div>

          {txid && (
            <a href={explorerTx(txid)} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-[13px] text-secondary hover:text-on-surface transition-colors">
              Transaction submitted, view on explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {error && <p className="mt-4 text-[13px] text-center text-red-400">{error}</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}

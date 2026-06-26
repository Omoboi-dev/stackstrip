import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowDown, Info, Droplet, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useWallet } from '../lib/wallet';
import { useToast } from '../components/ui/Toast';
import { deposit, swapBaseForPt, swapPtForBase, faucet, getBalance, getReserves, getMarketInfo, settle, redeemPt, redeemYt, explorerTx } from '../lib/stacks';

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export function MarketDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('trade');
  const [tradeAction, setTradeAction] = useState('buy');
  const [assetType, setAssetType] = useState('PT');

  const { address, connected, connectWallet } = useWallet();
  const { push } = useToast();
  const [amount, setAmount] = useState('1000');
  const [busy, setBusy] = useState(false);
  const [bal, setBal] = useState({ base: 0, pt: 0, yt: 0 });
  const [reserves, setReserves] = useState({ base: 0, pt: 0 });
  const [market, setMarket] = useState({ settled: false, matured: false, maturity: 0 });
  const [redeemAmt, setRedeemAmt] = useState('');

  const loadData = useCallback(async () => {
    try {
      const r = await getReserves();
      setReserves({ base: r.base, pt: r.pt });
      const info = await getMarketInfo();
      setMarket({ settled: info.settled, matured: info.matured, maturity: info.maturity });
      if (address) {
        const [base, pt, yt] = await Promise.all([
          getBalance('mockStstx', address),
          getBalance('pt', address),
          getBalance('yt', address),
        ]);
        setBal({ base, pt, yt });
      }
    } catch {
      // read errors are non-fatal
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      const res: any = await fn();
      const tx = res?.txid ?? res?.txId ?? null;
      push({ type: 'info', message: 'Transaction submitted', href: tx ? explorerTx(tx) : undefined });
      setTimeout(loadData, 8000);
    } catch (e: any) {
      push({ type: 'error', message: e?.message ?? 'Transaction cancelled' });
    } finally {
      setBusy(false);
    }
  };

  const amt = Number(amount) || 0;
  const rAmt = Number(redeemAmt) || 0;
  // PT accretes to par (1.0) at maturity; this curve is the fixed-yield path.
  const ptPrice = reserves.pt > 0 ? reserves.base / reserves.pt : 1;
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    return {
      label: i === 0 ? 'Now' : i === 5 ? 'Maturity' : `${Math.round(t * 100)}%`,
      price: Number((ptPrice + (1 - ptPrice) * t).toFixed(4)),
    };
  });
  const handleFaucet = () => run(() => faucet(address!));
  const handleAction = () => {
    if (!connected || !address) return connectWallet();
    if (activeTab === 'mint') return run(() => deposit(address, amt));
    if (tradeAction === 'buy') return run(() => swapBaseForPt(address, amt));
    return run(() => swapPtForBase(address, amt));
  };
  const handleSettle = () => run(() => settle());
  const handleRedeemPt = () => run(() => redeemPt(rAmt));
  const handleRedeemYt = () => run(() => redeemYt(rAmt));

  const actionLabel = !connected
    ? 'Connect Wallet'
    : busy
      ? 'Confirm in wallet...'
      : activeTab === 'mint'
        ? 'Split into PT + YT'
        : tradeAction === 'buy'
          ? 'Buy PT'
          : 'Sell PT';

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-stack-lg gap-stack-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/markets" className="text-on-surface-variant hover:text-on-surface flex items-center justify-center bg-surface-container p-2 rounded-full border border-border-subtle transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">PT-sBTC</h1>
            </div>
            <span className="bg-secondary-container/20 text-secondary border border-secondary/30 rounded-full px-3 py-1 text-data-md ml-2 hidden sm:inline-block">
              Fixed 8.42% APY
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            Maturity: <span className="text-data-md text-on-background">28 JUN 2027</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant mx-1"></span>
            Underlying: <span className="text-data-md text-on-background">sBTC</span>
          </p>
        </div>
        <div className="flex gap-stack-md w-full md:w-auto">
          <div className="bg-surface-container border border-border-subtle rounded-lg p-3 flex-1 md:min-w-[120px]">
            <p className="text-label-sm text-on-surface-variant mb-1">Total Liquidity</p>
            <p className="text-data-lg text-on-background">$24.5M</p>
          </div>
          <div className="bg-surface-container border border-border-subtle rounded-lg p-3 flex-1 md:min-w-[120px]">
            <p className="text-label-sm text-on-surface-variant mb-1">24h Volume</p>
            <p className="text-data-lg text-on-background">$1.2M</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-stack-lg">
          {/* Chart */}
          <motion.div 
            className="glass-card p-6 flex flex-col min-h-[400px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-headline-md text-on-background">PT Price to Par</h2>
              <div className="flex bg-surface-container-highest p-1 rounded-lg border border-border-subtle">
                {['1W', '1M', 'ALL'].map((time) => (
                  <button 
                    key={time}
                    className={`px-3 py-1 text-label-sm rounded ${time === '1M' ? 'bg-surface-variant text-on-background shadow-sm' : 'text-on-surface-variant hover:text-on-background'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-grow w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--color-on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(val) => `${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="var(--color-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pool Info */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-label-sm text-on-surface-variant mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Pool Reserves
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                <span className="text-data-md text-on-surface-variant">Pool PT</span>
                <span className="text-data-md text-on-surface">{fmt(reserves.pt)} PT</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                <span className="text-data-md text-on-surface-variant">Pool stSTX</span>
                <span className="text-data-md text-on-surface">{fmt(reserves.base)} stSTX</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                <span className="text-data-md text-on-surface-variant">Your PT</span>
                <span className="text-data-md text-primary">{fmt(bal.pt)} PT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-data-md text-on-surface-variant">Your YT</span>
                <span className="text-data-md text-secondary">{fmt(bal.yt)} YT</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Trading Widget */}
        <motion.div 
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card overflow-hidden sticky top-24">
            {/* Tabs */}
            <div className="flex border-b border-border-subtle bg-surface-container-lowest">
              <button 
                onClick={() => setActiveTab('trade')}
                className={`flex-1 py-4 text-label-sm ${activeTab === 'trade' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
              >
                Trade
              </button>
              <button
                onClick={() => setActiveTab('mint')}
                className={`flex-1 py-4 text-label-sm ${activeTab === 'mint' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
              >
                Mint/Split
              </button>
              <button
                onClick={() => setActiveTab('redeem')}
                className={`flex-1 py-4 text-label-sm ${activeTab === 'redeem' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
              >
                Redeem
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {activeTab === 'redeem' ? (
                <div className="flex flex-col gap-5">
                  {!market.matured ? (
                    <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-5 text-center">
                      <p className="text-body-md text-on-surface">This market has not matured yet.</p>
                      <p className="text-data-md text-[12px] text-on-surface-variant mt-1">Redemption opens at block {market.maturity.toLocaleString()}.</p>
                    </div>
                  ) : !market.settled ? (
                    <>
                      <p className="text-body-md text-on-surface-variant leading-snug">The market has matured. Settle it once to freeze the final rate, then PT and YT become redeemable.</p>
                      <button onClick={handleSettle} disabled={busy} className="w-full py-4 rounded-lg bg-primary text-on-primary text-headline-md text-[16px] uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70">
                        {busy && <Loader2 className="w-5 h-5 animate-spin" />} Settle Market
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-surface-container-lowest rounded-lg p-4 border border-border-subtle">
                        <label className="text-label-sm text-on-surface-variant block mb-1">Amount to redeem</label>
                        <div className="flex items-center justify-between">
                          <input type="text" inputMode="decimal" value={redeemAmt} onChange={(e) => setRedeemAmt(e.target.value.replace(/[^0-9.]/g, ''))} className="bg-transparent border-none outline-none text-display-lg-mobile text-on-surface p-0 w-full" placeholder="0.00" />
                        </div>
                        <div className="flex justify-end gap-3 mt-1">
                          <button onClick={() => setRedeemAmt(String(bal.pt))} className="text-[12px] text-primary">PT: {fmt(bal.pt)}</button>
                          <button onClick={() => setRedeemAmt(String(bal.yt))} className="text-[12px] text-secondary">YT: {fmt(bal.yt)}</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleRedeemPt} disabled={busy} className="py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-label-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">Redeem PT</button>
                        <button onClick={handleRedeemYt} disabled={busy} className="py-3 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary text-label-sm hover:bg-secondary hover:text-on-primary transition-colors disabled:opacity-60">Redeem YT</button>
                      </div>
                      <p className="text-[12px] text-on-surface-variant text-center">PT redeems for principal, YT redeems for accrued yield.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
              {/* Buy/Sell */}
              <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-border-subtle">
                <button 
                  onClick={() => setTradeAction('buy')}
                  className={`flex-1 py-2 text-label-sm rounded ${tradeAction === 'buy' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setTradeAction('sell')}
                  className={`flex-1 py-2 text-label-sm rounded ${tradeAction === 'sell' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Sell
                </button>
              </div>

              {/* Asset Type */}
              <div>
                <label className="text-label-sm text-on-surface-variant mb-2 block">Asset</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAssetType('PT')}
                    className={`rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-all border ${assetType === 'PT' ? 'border-primary bg-primary/10' : 'border-border-subtle bg-surface-container-lowest hover:border-outline/50'}`}
                  >
                    <span className={`text-data-md font-bold ${assetType === 'PT' ? 'text-primary' : 'text-on-surface'}`}>PT</span>
                    <span className="text-label-sm text-on-surface-variant">Principal Token</span>
                  </button>
                  <button 
                    onClick={() => setAssetType('YT')}
                    className={`rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-all border ${assetType === 'YT' ? 'border-secondary bg-secondary/10' : 'border-border-subtle bg-surface-container-lowest hover:border-outline/50'}`}
                  >
                    <span className={`text-data-md font-bold ${assetType === 'YT' ? 'text-secondary' : 'text-on-surface'}`}>YT</span>
                    <span className="text-label-sm text-on-surface-variant">Yield Token</span>
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="bg-surface-container-lowest rounded-lg p-4 border border-border-subtle focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <label className="text-label-sm text-on-surface-variant block mb-1">Pay with</label>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="bg-transparent border-none outline-none text-display-lg-mobile text-on-surface p-0 w-full"
                    placeholder="0.00"
                  />
                  <div className="flex items-center gap-2 bg-surface-container p-2 rounded shrink-0">
                    <span className="text-label-sm text-on-surface">stSTX</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <button
                    onClick={handleFaucet}
                    disabled={!connected || busy}
                    className="flex items-center gap-1 text-[12px] text-secondary hover:text-on-surface transition-colors disabled:opacity-40"
                  >
                    <Droplet className="w-3 h-3" /> Get test stSTX
                  </button>
                  <span className="text-data-md text-[12px] text-on-surface-variant">
                    Balance: {fmt(bal.base)} stSTX
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-surface border border-border-subtle rounded-full p-1 shadow-md">
                  <ArrowDown className="w-5 h-5 text-outline-variant" />
                </div>
              </div>

              {/* Output */}
              <div className="bg-surface-container-lowest rounded-lg p-4 border border-border-subtle">
                <label className="text-label-sm text-on-surface-variant block mb-1">Receive (Est.)</label>
                <div className="flex items-center justify-between">
                  <input type="text" className={`bg-transparent border-none outline-none text-display-lg-mobile p-0 w-full ${assetType === 'PT' ? 'text-primary' : 'text-secondary'}`} readOnly value="1084.20" />
                  <div className="flex items-center p-2 shrink-0">
                    <span className={`text-label-sm font-bold ${assetType === 'PT' ? 'text-primary' : 'text-secondary'}`}>{assetType}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-primary-container border border-primary/20 rounded-lg p-3 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-body-md text-[14px] text-on-surface leading-snug">
                  You are locking in a <strong className="text-primary text-data-md">8.42%</strong> fixed APY. Hold PT until maturity to guarantee this return.
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex justify-between items-center">
                  <span className="text-label-sm text-on-surface-variant">Price Impact</span>
                  <span className="text-data-md text-[12px] text-secondary">&lt; 0.01%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-sm text-on-surface-variant">Max Slippage</span>
                  <span className="text-data-md text-[12px] text-on-surface">0.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-sm text-on-surface-variant">Network Fee</span>
                  <span className="text-data-md text-[12px] text-on-surface">~$0.45</span>
                </div>
              </div>

              <button
                onClick={handleAction}
                disabled={busy}
                className="w-full py-4 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary text-headline-md text-[16px] uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(255,184,116,0.2)] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {busy && <Loader2 className="w-5 h-5 animate-spin" />}
                {actionLabel}
              </button>

              </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

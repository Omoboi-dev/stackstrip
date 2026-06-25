import {
  Cl,
  ClarityValue,
  Pc,
  PostCondition,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { request } from '@stacks/connect';

export const NETWORK = 'testnet' as const;
export const DEPLOYER = 'ST1D9X179MAJ9XA7KHSZJ48CN39DVB6TAQDYST34R';

// Fully-qualified contract identifiers.
export const C = {
  mockStstx: `${DEPLOYER}.mock-ststx`,
  pt: `${DEPLOYER}.pt-token`,
  yt: `${DEPLOYER}.yt-token`,
  amm: `${DEPLOYER}.amm`,
  market: `${DEPLOYER}.yield-market`,
} as const;

const NAME = { mockStstx: 'mock-ststx', pt: 'pt-token', yt: 'yt-token', amm: 'amm', market: 'yield-market' } as const;
// SIP-010 fungible asset names inside each token contract.
const FT = { mockStstx: 'mock-ststx', pt: 'pt', yt: 'yt' } as const;

export const ONE = 1_000_000;
export const toMicro = (n: number | string) => BigInt(Math.floor((Number(n) || 0) * ONE));
export const fromMicro = (m: bigint | number | string) => Number(m) / ONE;
export const explorerTx = (t: string) => `https://explorer.hiro.so/txid/${t}?chain=testnet`;
export const explorerAddress = (a: string) => `https://explorer.hiro.so/address/${a}?chain=testnet`;

// Coerce any cvToValue shape (BigInt, string, or { value }) to a number.
function asNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'object' && 'value' in v) return asNum(v.value);
  return 0;
}

async function read(name: string, fn: string, args: ClarityValue[] = []) {
  const r = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: name,
    functionName: fn,
    functionArgs: args,
    network: NETWORK,
    senderAddress: DEPLOYER,
  });
  return cvToValue(r);
}

// ---------- reads (return whole-token numbers) ----------
export async function getBalance(token: 'mockStstx' | 'pt' | 'yt', who: string): Promise<number> {
  return fromMicro(asNum(await read(NAME[token], 'get-balance', [Cl.principal(who)])));
}

export async function getReserves(): Promise<{ base: number; pt: number; baseMicro: bigint; ptMicro: bigint }> {
  const v: any = await read('amm', 'get-reserves');
  const baseMicro = BigInt(asNum(v?.base));
  const ptMicro = BigInt(asNum(v?.pt));
  return { base: fromMicro(baseMicro), pt: fromMicro(ptMicro), baseMicro, ptMicro };
}

export async function quoteBaseForPtMicro(microIn: bigint): Promise<bigint> {
  return BigInt(asNum(await read('amm', 'quote-base-for-pt', [Cl.uint(microIn)])));
}

export async function getMarketInfo() {
  const [maturity, startRate, settleRate, settled, rate] = await Promise.all([
    read('yield-market', 'get-maturity'),
    read('yield-market', 'get-start-rate'),
    read('yield-market', 'get-settle-rate'),
    read('yield-market', 'is-settled'),
    read('mock-ststx', 'get-exchange-rate'),
  ]);
  return {
    maturity: asNum(maturity),
    startRate: asNum(startRate),
    settleRate: asNum(settleRate),
    settled: Boolean((settled as any)?.value ?? settled),
    exchangeRate: asNum(rate),
  };
}

// ---------- writes (deny mode + explicit post-conditions) ----------
async function call(
  name: string,
  fn: string,
  args: ClarityValue[],
  postConditions: PostCondition[] = [],
  mode: 'allow' | 'deny' = 'deny',
) {
  return request('stx_callContract', {
    contract: `${DEPLOYER}.${name}`,
    functionName: fn,
    functionArgs: args,
    network: NETWORK,
    postConditions,
    postConditionMode: mode,
  });
}

// Faucet mints new tokens to the user (a mint, not a transfer, so no post-condition needed).
export function faucet(user: string, tokens = 1000) {
  return call('mock-ststx', 'mint', [Cl.uint(toMicro(tokens)), Cl.principal(user)]);
}

// Deposit: the user sends exactly `tokens` stSTX in; PT and YT are minted to them.
export function deposit(user: string, tokens: number) {
  const amount = toMicro(tokens);
  return call(
    'yield-market',
    'deposit',
    [Cl.uint(amount)],
    [Pc.principal(user).willSendEq(amount).ft(C.mockStstx, FT.mockStstx)],
  );
}

// Buy PT: user sends exactly `tokens` stSTX, AMM must send at least the slippage-protected PT out.
export async function swapBaseForPt(user: string, tokens: number, slippagePct = 1) {
  const amount = toMicro(tokens);
  const quoted = await quoteBaseForPtMicro(amount);
  const minOut = (quoted * BigInt(Math.floor((100 - slippagePct) * 100))) / 10000n;
  return call(
    'amm',
    'swap-base-for-pt',
    [Cl.uint(amount), Cl.uint(minOut)],
    [
      Pc.principal(user).willSendEq(amount).ft(C.mockStstx, FT.mockStstx),
      Pc.principal(C.amm).willSendGte(minOut).ft(C.pt, FT.pt),
    ],
  );
}

// Sell PT: user sends exactly `tokens` PT, AMM must send at least the slippage-protected stSTX out.
export async function swapPtForBase(user: string, tokens: number, slippagePct = 1) {
  const amount = toMicro(tokens);
  const { baseMicro, ptMicro } = await getReserves();
  const inFee = (amount * 997n) / 1000n;
  const baseOut = (baseMicro * inFee) / (ptMicro + inFee);
  const minOut = (baseOut * BigInt(Math.floor((100 - slippagePct) * 100))) / 10000n;
  return call(
    'amm',
    'swap-pt-for-base',
    [Cl.uint(amount), Cl.uint(minOut)],
    [
      Pc.principal(user).willSendEq(amount).ft(C.pt, FT.pt),
      Pc.principal(C.amm).willSendGte(minOut).ft(C.mockStstx, FT.mockStstx),
    ],
  );
}

// ---------- liquidity ----------
export async function getLpShares(who: string): Promise<number> {
  return fromMicro(asNum(await read('amm', 'get-lp-shares', [Cl.principal(who)])));
}

export async function getTotalLp(): Promise<{ lp: number; lpMicro: bigint }> {
  const m = BigInt(asNum(await read('amm', 'get-total-lp')));
  return { lp: fromMicro(m), lpMicro: m };
}

// Add liquidity: user sends exactly `baseTokens` stSTX and up to `maxPtTokens` PT.
export function addLiquidity(user: string, baseTokens: number, maxPtTokens: number) {
  const baseAmount = toMicro(baseTokens);
  const maxPt = toMicro(maxPtTokens);
  return call(
    'amm',
    'add-liquidity',
    [Cl.uint(baseAmount), Cl.uint(maxPt)],
    [
      Pc.principal(user).willSendEq(baseAmount).ft(C.mockStstx, FT.mockStstx),
      Pc.principal(user).willSendLte(maxPt).ft(C.pt, FT.pt),
    ],
  );
}

// Remove liquidity: AMM returns at least the slippage-protected base and PT for the LP burned.
export async function removeLiquidity(lpTokens: number, slippagePct = 1) {
  const lpAmount = toMicro(lpTokens);
  const { baseMicro, ptMicro } = await getReserves();
  const { lpMicro } = await getTotalLp();
  const factor = BigInt(Math.floor((100 - slippagePct) * 100));
  const baseOut = lpMicro > 0n ? (lpAmount * baseMicro) / lpMicro : 0n;
  const ptOut = lpMicro > 0n ? (lpAmount * ptMicro) / lpMicro : 0n;
  return call(
    'amm',
    'remove-liquidity',
    [Cl.uint(lpAmount)],
    [
      Pc.principal(C.amm).willSendGte((baseOut * factor) / 10000n).ft(C.mockStstx, FT.mockStstx),
      Pc.principal(C.amm).willSendGte((ptOut * factor) / 10000n).ft(C.pt, FT.pt),
    ],
  );
}

export { Cl };

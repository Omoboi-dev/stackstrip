import { describe, expect, it, beforeAll } from 'vitest';
import { initSimnet } from '@stacks/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!; // liquidity provider
const wallet2 = accounts.get('wallet_2')!; // trader
const market = Cl.contractPrincipal(deployer, 'yield-market');

const POOL = 1_000_000; // 1.0 of each side
const SWAP_IN = 100_000;

// expected pt-out for SWAP_IN against a 1:1 pool with 0.3% fee
const inFee = Math.floor((SWAP_IN * 997) / 1000);
const expectedPtOut = Math.floor((POOL * inFee) / (POOL + inFee));

beforeAll(() => {
  // stand up the market so wallet1 can obtain PT
  const maturity = simnet.blockHeight + 1000;
  simnet.callPublicFn('yield-market', 'initialize', [Cl.uint(maturity)], deployer);
  simnet.callPublicFn('pt-token', 'set-minter', [market], deployer);
  simnet.callPublicFn('yt-token', 'set-minter', [market], deployer);

  simnet.callPublicFn('mock-ststx', 'mint', [Cl.uint(10_000_000), Cl.principal(wallet1)], wallet1);
  simnet.callPublicFn('yield-market', 'deposit', [Cl.uint(5_000_000)], wallet1); // wallet1 gets 5e6 PT
  simnet.callPublicFn('mock-ststx', 'mint', [Cl.uint(1_000_000), Cl.principal(wallet2)], wallet2);
});

describe('amm', () => {
  it('seeds a 1:1 pool and records LP shares', () => {
    const add = simnet.callPublicFn('amm', 'add-liquidity', [Cl.uint(POOL), Cl.uint(POOL)], wallet1);
    expect(add.result).toStrictEqual(Cl.ok(Cl.uint(POOL)));

    const reserves = simnet.callReadOnlyFn('amm', 'get-reserves', [], wallet1);
    expect(reserves.result).toStrictEqual(Cl.tuple({ base: Cl.uint(POOL), pt: Cl.uint(POOL) }));

    const lp = simnet.callReadOnlyFn('amm', 'get-lp-shares', [Cl.principal(wallet1)], wallet1);
    expect(lp.result).toStrictEqual(Cl.uint(POOL));
  });

  it('quotes and swaps base for PT with the 0.3% fee', () => {
    const quote = simnet.callReadOnlyFn('amm', 'quote-base-for-pt', [Cl.uint(SWAP_IN)], wallet2);
    expect(quote.result).toStrictEqual(Cl.uint(expectedPtOut));

    const swap = simnet.callPublicFn('amm', 'swap-base-for-pt', [Cl.uint(SWAP_IN), Cl.uint(0)], wallet2);
    expect(swap.result).toStrictEqual(Cl.ok(Cl.uint(expectedPtOut)));

    const ptBal = simnet.callReadOnlyFn('pt-token', 'get-balance', [Cl.principal(wallet2)], wallet2);
    expect(ptBal.result).toStrictEqual(Cl.ok(Cl.uint(expectedPtOut)));

    const reserves = simnet.callReadOnlyFn('amm', 'get-reserves', [], wallet2);
    expect(reserves.result).toStrictEqual(
      Cl.tuple({ base: Cl.uint(POOL + SWAP_IN), pt: Cl.uint(POOL - expectedPtOut) }),
    );
  });

  it('rejects a swap that fails the slippage floor', () => {
    const swap = simnet.callPublicFn('amm', 'swap-base-for-pt', [Cl.uint(SWAP_IN), Cl.uint(10_000_000)], wallet2);
    expect(swap.result).toStrictEqual(Cl.error(Cl.uint(302)));
  });
});

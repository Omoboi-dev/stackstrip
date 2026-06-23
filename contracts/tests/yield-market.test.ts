import { describe, expect, it, beforeAll } from 'vitest';
import { initSimnet } from '@stacks/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const market = Cl.contractPrincipal(deployer, 'yield-market');

const ONE = 1_000_000; // 1.0 token (6 decimals)
const START_RATE = 100_000_000; // 1.0 scaled 1e8
const END_RATE = 109_000_000; // +9% yield

const ptShares = Math.floor((ONE * START_RATE) / END_RATE);
const ytShares = Math.floor((ONE * (END_RATE - START_RATE)) / END_RATE);

let maturity = 0;

// simnet state persists across tests in a file, so set up once and run in order.
beforeAll(() => {
  maturity = simnet.blockHeight + 50;
  simnet.callPublicFn('yield-market', 'initialize', [Cl.uint(maturity)], deployer);
  simnet.callPublicFn('pt-token', 'set-minter', [market], deployer);
  simnet.callPublicFn('yt-token', 'set-minter', [market], deployer);
  simnet.callPublicFn('mock-ststx', 'mint', [Cl.uint(ONE), Cl.principal(wallet1)], wallet1);
});

describe('yield-market lifecycle', () => {
  it('splits a deposit into equal PT and YT and holds the underlying', () => {
    const dep = simnet.callPublicFn('yield-market', 'deposit', [Cl.uint(ONE)], wallet1);
    expect(dep.result).toStrictEqual(Cl.ok(Cl.uint(ONE)));

    const pt = simnet.callReadOnlyFn('pt-token', 'get-balance', [Cl.principal(wallet1)], wallet1);
    const yt = simnet.callReadOnlyFn('yt-token', 'get-balance', [Cl.principal(wallet1)], wallet1);
    expect(pt.result).toStrictEqual(Cl.ok(Cl.uint(ONE)));
    expect(yt.result).toStrictEqual(Cl.ok(Cl.uint(ONE)));

    const held = simnet.callReadOnlyFn('mock-ststx', 'get-balance', [market], wallet1);
    expect(held.result).toStrictEqual(Cl.ok(Cl.uint(ONE)));
  });

  it('rejects redeeming before settlement', () => {
    const early = simnet.callPublicFn('yield-market', 'redeem-pt', [Cl.uint(ONE)], wallet1);
    expect(early.result).toStrictEqual(Cl.error(Cl.uint(205)));
  });

  it('settles at maturity and redeems PT for principal and YT for yield', () => {
    simnet.callPublicFn('mock-ststx', 'set-exchange-rate', [Cl.uint(END_RATE)], deployer);
    const toMine = maturity - simnet.blockHeight + 1;
    simnet.mineEmptyBlocks(toMine > 0 ? toMine : 1);

    const settle = simnet.callPublicFn('yield-market', 'settle', [], wallet1);
    expect(settle.result).toStrictEqual(Cl.ok(Cl.uint(END_RATE)));

    const rPt = simnet.callPublicFn('yield-market', 'redeem-pt', [Cl.uint(ONE)], wallet1);
    expect(rPt.result).toStrictEqual(Cl.ok(Cl.uint(ptShares)));

    const rYt = simnet.callPublicFn('yield-market', 'redeem-yt', [Cl.uint(ONE)], wallet1);
    expect(rYt.result).toStrictEqual(Cl.ok(Cl.uint(ytShares)));

    const bal = simnet.callReadOnlyFn('mock-ststx', 'get-balance', [Cl.principal(wallet1)], wallet1);
    expect(bal.result).toStrictEqual(Cl.ok(Cl.uint(ptShares + ytShares)));
  });
});

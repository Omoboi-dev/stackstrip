import { describe, expect, it } from 'vitest';
import { initSimnet } from '@stacks/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

describe('mock-ststx', () => {
  it('mints from the faucet and tracks balances', () => {
    const mint = simnet.callPublicFn('mock-ststx', 'mint', [Cl.uint(1_000_000), Cl.principal(wallet1)], wallet1);
    expect(mint.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const bal = simnet.callReadOnlyFn('mock-ststx', 'get-balance', [Cl.principal(wallet1)], wallet1);
    expect(bal.result).toStrictEqual(Cl.ok(Cl.uint(1_000_000)));
  });

  it('starts at exchange rate 1.0 (1e8)', () => {
    const rate = simnet.callReadOnlyFn('mock-ststx', 'get-exchange-rate', [], wallet1);
    expect(rate.result).toStrictEqual(Cl.ok(Cl.uint(100_000_000)));
  });

  it('only the owner can raise the rate, and it cannot go down', () => {
    const byStranger = simnet.callPublicFn('mock-ststx', 'set-exchange-rate', [Cl.uint(109_000_000)], wallet1);
    expect(byStranger.result).toStrictEqual(Cl.error(Cl.uint(100)));

    const decrease = simnet.callPublicFn('mock-ststx', 'set-exchange-rate', [Cl.uint(50_000_000)], deployer);
    expect(decrease.result).toStrictEqual(Cl.error(Cl.uint(102)));

    const raise = simnet.callPublicFn('mock-ststx', 'set-exchange-rate', [Cl.uint(109_000_000)], deployer);
    expect(raise.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const rate = simnet.callReadOnlyFn('mock-ststx', 'get-exchange-rate', [], deployer);
    expect(rate.result).toStrictEqual(Cl.ok(Cl.uint(109_000_000)));
  });

  it('transfers between holders', () => {
    const transfer = simnet.callPublicFn(
      'mock-ststx',
      'transfer',
      [Cl.uint(400_000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1,
    );
    expect(transfer.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const bal = simnet.callReadOnlyFn('mock-ststx', 'get-balance', [Cl.principal(wallet2)], wallet1);
    expect(bal.result).toStrictEqual(Cl.ok(Cl.uint(400_000)));
  });
});

describe('pt-token minter lock', () => {
  it('rejects mint from a non-minter', () => {
    const mint = simnet.callPublicFn('pt-token', 'mint', [Cl.uint(100), Cl.principal(wallet1)], wallet1);
    expect(mint.result).toStrictEqual(Cl.error(Cl.uint(103)));
  });

  it('lets the deployer (default minter) mint, then locks the minter to a new principal', () => {
    const byDeployer = simnet.callPublicFn('pt-token', 'mint', [Cl.uint(100), Cl.principal(wallet1)], deployer);
    expect(byDeployer.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const setMinter = simnet.callPublicFn('pt-token', 'set-minter', [Cl.principal(wallet1)], deployer);
    expect(setMinter.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const oldMinter = simnet.callPublicFn('pt-token', 'mint', [Cl.uint(100), Cl.principal(wallet1)], deployer);
    expect(oldMinter.result).toStrictEqual(Cl.error(Cl.uint(103)));

    const newMinter = simnet.callPublicFn('pt-token', 'mint', [Cl.uint(100), Cl.principal(wallet1)], wallet1);
    expect(newMinter.result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const reSet = simnet.callPublicFn('pt-token', 'set-minter', [Cl.principal(wallet2)], deployer);
    expect(reSet.result).toStrictEqual(Cl.error(Cl.uint(104)));
  });
});

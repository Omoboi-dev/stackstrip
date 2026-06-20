import { describe, expect, it } from 'vitest';
import { initSimnet } from '@stacks/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;

describe('counter', () => {
  it('increments', () => {
    const { result } = simnet.callPublicFn('counter', 'increment', [], address1);
    expect(result.value.value).toBe(1n);
  });
  it('get-count returns current value', () => {
    const { result } = simnet.callReadOnlyFn('counter', 'get-count', [], address1);
    expect(result.value.value).toBe(1n);
  });
  it('decrement', () => {
    const { result } = simnet.callPublicFn('counter', 'decrement', [], address1);
    expect(result.value.value).toBe(0n);
  });
});

// One-shot: switch on the Stackstrip market on testnet.
// Reads the deployer seed from the local Testnet.toml and broadcasts the
// six setup transactions in order. (Already run once; kept for reference.)
import { readFileSync } from 'node:fs';
import { generateWallet } from '@stacks/wallet-sdk';
import { makeContractCall, broadcastTransaction, Cl, PostConditionMode } from '@stacks/transactions';

const DEPLOYER = 'ST1D9X179MAJ9XA7KHSZJ48CN39DVB6TAQDYST34R';
const MARKET = `${DEPLOYER}.yield-market`;
const NETWORK = 'testnet';
const API = 'https://api.testnet.hiro.so';
const TOML = '/home/modev/Grants Builds/stackstrip/contracts/settings/Testnet.toml';

const mnemonic = readFileSync(TOML, 'utf8').match(/mnemonic\s*=\s*"([^"]+)"/)[1].trim();
const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
const senderKey = wallet.accounts[0].stxPrivateKey;

const nonces = await fetch(`${API}/extended/v1/address/${DEPLOYER}/nonces`).then((r) => r.json());
let nonce = nonces.possible_next_nonce;
console.log('Deployer:', DEPLOYER, 'starting nonce:', nonce);

const calls = [
  { name: 'pt-token set-minter', contract: 'pt-token', fn: 'set-minter', args: [Cl.principal(MARKET)] },
  { name: 'yt-token set-minter', contract: 'yt-token', fn: 'set-minter', args: [Cl.principal(MARKET)] },
  { name: 'yield-market initialize', contract: 'yield-market', fn: 'initialize', args: [Cl.uint(4122688)] },
  { name: 'mock-ststx mint 10k', contract: 'mock-ststx', fn: 'mint', args: [Cl.uint(10_000_000_000), Cl.principal(DEPLOYER)] },
  { name: 'yield-market deposit 5k', contract: 'yield-market', fn: 'deposit', args: [Cl.uint(5_000_000_000)] },
  { name: 'amm add-liquidity 1k/1k', contract: 'amm', fn: 'add-liquidity', args: [Cl.uint(1_000_000_000), Cl.uint(1_000_000_000)] },
];

for (const c of calls) {
  const tx = await makeContractCall({
    contractAddress: DEPLOYER,
    contractName: c.contract,
    functionName: c.fn,
    functionArgs: c.args,
    senderKey,
    network: NETWORK,
    postConditionMode: PostConditionMode.Allow,
    nonce,
    fee: 3000,
  });
  const res = await broadcastTransaction({ transaction: tx, network: NETWORK });
  console.log(res.txid && !res.error ? `OK   ${c.name} -> ${res.txid}` : `FAIL ${c.name} -> ${JSON.stringify(res)}`);
  nonce++;
}

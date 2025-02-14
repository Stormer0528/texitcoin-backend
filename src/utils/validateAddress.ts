import { TexitcoinNetwork } from '@/consts/texitcoin';
import * as bitcoin from 'bitcoinjs-lib';

export const validateAddresses = (addresses: string[]): [boolean, string[]] => {
  const verifyRes: [string, boolean][] = addresses.map((address) => [
    address,
    validateAddress(address),
  ]);
  const res = verifyRes.reduce((prev, cur) => prev && cur[1], true);
  return [res, verifyRes.filter((vrf) => !vrf[1]).map((vrf) => vrf[0])];
};

export const validateAddress = (address: string): boolean => {
  try {
    bitcoin.address.toOutputScript(address, TexitcoinNetwork);
    return true;
  } catch (_err) {
    return false;
  }
};

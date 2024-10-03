export const TexitcoinNetwork = {
  // TEXITcoin Network
  /**
   * The message prefix used for signing Texitcoin messages.
   */
  messagePrefix: '\x19Texitcoin Signed Message:\n',
  /**
   * The Bech32 prefix used for Texitcoin addresses.
   */
  bech32: 'txc',
  /**
   * The BIP32 key prefixes for Texitcoin.
   */
  bip32: {
    /**
     * The public key prefix for BIP32 extended public keys.
     */
    public: 0x0436f6e1,
    /**
     * The private key prefix for BIP32 extended private keys.
     */
    private: 0x0436ef7d,
  },
  /**
   * The prefix for Texitcoin public key hashes.
   */
  pubKeyHash: 0x42,
  /**
   * The prefix for Texitcoin script hashes.
   */
  scriptHash: 0x41,
  /**
   * The prefix for Texitcoin Wallet Import Format (WIF) private keys.
   */
  wif: 0xc1,
};

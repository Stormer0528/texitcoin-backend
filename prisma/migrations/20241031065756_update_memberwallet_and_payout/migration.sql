-- This is an empty migration.

UPDATE payouts SET method='ETH', name='etc', display='ETH Wallet Address' WHERE id='69f1351c-e7c8-4c98-9030-2f0469f86b76';
UPDATE payouts SET method='TXC-COLD', name='txc-cold', display='TXC Cold Wallet Address' WHERE id='6f7681f0-9ccf-4a79-b1cb-f87e56cf7e8a';
UPDATE payouts SET method='OTHER', name='other', display='Other Wallet Address' WHERE id='ac26f196-d377-4846-8b86-7a7dda622d01';
UPDATE payouts SET method='TXC-HOT', name='txc-hot', display='TXC Hot Wallet Address' WHERE id='b3ed0e78-6cc8-465c-9454-0576534f06f2';
UPDATE payouts SET method='USDT', name='usdt', display='USDT Wallet Address' WHERE id='f8717a04-6203-482a-bed0-58bfb9c6f7e0';
UPDATE payouts SET method='BTC', name='btc', display='BTC Wallet Address' WHERE id='fc6302d9-7819-4cd6-a1a4-68b03286c86f';

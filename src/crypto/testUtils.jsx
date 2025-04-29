import { ec as EC } from 'elliptic';
import BN from 'bn.js';

export async function generateTestKey() {
  const curve = new EC('p256');
  const keyPair = curve.genKeyPair();

  return {
    d: new BN(keyPair.getPrivate().toArray()),
    publicKey: {
      x: keyPair.getPublic().getX().toString('hex'),
      y: keyPair.getPublic().getY().toString('hex'),
      curve: 'p256'
    }
  };
}


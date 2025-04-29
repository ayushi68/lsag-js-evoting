import BN from 'bn.js';

export const PublicKey = {
  x: '',
  y: '',
  curve: ''
};

export const PrivateKey = {
  d: new BN(0),
  publicKey: PublicKey
};

export const Signature = {
  keyImage: { x: '', y: '' },
  c: [],
  r: []
};

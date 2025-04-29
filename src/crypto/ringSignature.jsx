import { ec as EC } from 'elliptic';
import { sha3_256 } from 'js-sha3';
import BN from 'bn.js';

const curve = new EC('p256');

// Helper function to convert hex to Uint8Array
const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

// Generate Key Image
const generateKeyImage = (privateKey) => {
  const h = hashToCurve(hexToBytes(privateKey.publicKey.x));
  const point = h.mul(privateKey.d);
  return {
    x: point.getX().toString('hex'),
    y: point.getY().toString('hex'),
  };
};

// Hash function for message and EC points
const generateChain = (message, L) => {
  const hash = sha3_256.create();
  hash.update(message);
  hash.update(hexToBytes(L.getX().toString('hex')));
  hash.update(hexToBytes(L.getY().toString('hex')));
  return new BN(hash.digest());
};

// Hash function to map input to elliptic curve
const hashToCurve = (input) => {
  const hash = sha3_256.create();
  hash.update(input);
  const hashValue = new BN(hash.digest());
  return curve.g.mul(hashValue);
};

// Signing Function
export const createSignature = async (privateKey, publicKeys, message) => {
  if (!privateKey || !publicKeys || !message) {
    throw new Error('Missing required parameters');
  }

  const n = publicKeys.length;
  const signerIndex = publicKeys.findIndex(
    (pk) => pk.x === privateKey.publicKey.x && pk.y === privateKey.publicKey.y
  );

  if (signerIndex === -1) {
    throw new Error('Signer public key not found in ring');
  }

  // Generate key image
  const keyImage = generateKeyImage(privateKey);

  // Initialize challenge and response arrays
  const c = new Array(n);
  const r = new Array(n);
  const L = new Array(n);

  // Generate random responses for all except signer
  for (let i = 0; i < n; i++) {
    if (i === signerIndex) continue;
    r[i] = new BN(curve.genKeyPair().getPrivate().toArray());
  }

  // Choose random u for signer
  const u = new BN(curve.genKeyPair().getPrivate().toArray());
  L[signerIndex] = curve.g.mul(u);

  // Start challenge chain
  const nextIdx = (signerIndex + 1) % n;
  c[nextIdx] = generateChain(message, L[signerIndex]);

  // Loop through the ring
  for (let k = 1; k < n; k++) {
    const i = (signerIndex + k) % n;
    const pubPoint = curve.keyFromPublic(
      { x: publicKeys[i].x, y: publicKeys[i].y },
      'hex'
    ).getPublic();

    L[i] = curve.g.mul(r[i]).add(pubPoint.mul(c[i]));
    const next = (i + 1) % n;
    c[next] = generateChain(message, L[i]);
  }

  // Compute response for signer
  r[signerIndex] = u.sub(privateKey.d.mul(c[signerIndex])).umod(curve.n);

  return {
    keyImage,
    c,
    r,
  };
};

export const verifySignature = async (signature, publicKeys, message) => {
  const n = publicKeys.length;
  const cChain = new Array(n);

  // Ensure c and r are converted properly
  const challenges = signature.c.map((c) => (BN.isBN(c) ? c : new BN(c, 16))); // HEX Format
  const responses = signature.r.map((r) => (BN.isBN(r) ? r : new BN(r, 16)));

  for (let i = 0; i < n; i++) {
    const pubPoint = curve.keyFromPublic(
      { x: publicKeys[i].x, y: publicKeys[i].y },
      'hex'
    ).getPublic();

    const L_i = curve.g.mul(responses[i]).add(pubPoint.mul(challenges[i]));
    cChain[(i + 1) % n] = generateChain(message, L_i);
  }

  // Ensure all values match in the chain
  for (let i = 0; i < n; i++) {
    if (!challenges[i].eq(cChain[i])) {
      console.error(`Challenge mismatch at index ${i}`);
      return false;
    }
  }

  return true;
};


export const checkLinkability = (sig1, sig2) => {
  if (!sig1 || !sig2) {
    console.error("Missing signatures for linkability check.");
    return false;
  }

  // Extract key images from both signatures
  const keyImage1 = sig1.keyImage;
  const keyImage2 = sig2.keyImage;

  console.log("Key Image 1:", keyImage1);
  console.log("Key Image 2:", keyImage2);

  // If key images match, signatures are linked
  return keyImage1.x === keyImage2.x && keyImage1.y === keyImage2.y;
};

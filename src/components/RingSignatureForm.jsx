import React, { useState } from 'react';
import { createSignature, verifySignature, checkLinkability } from "../crypto/ringSignature.jsx";
import { generateTestKey } from "../crypto/testUtils.jsx";

export default function RingSignatureForm() {
  const [keyPairs, setKeyPairs] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedPrivateKey, setSelectedPrivateKey] = useState('');
  const [signature, setSignature] = useState('');  
  const [verificationResult, setVerificationResult] = useState(null);
  const [sig1, setSig1] = useState('');
  const [sig2, setSig2] = useState('');
  const [linkabilityResult, setLinkabilityResult] = useState(null);
  


  const handleSign = async () => {
    if (keyPairs.length === 0) {
      alert("No key pairs available! Generate a key first.");
      return;
    }
  
    const publicKeys = keyPairs.map((pair) => pair.publicKey);
    const privateKey = keyPairs[0]; // Using the first key for signing
  
    try {
      const sig = await createSignature(privateKey, publicKeys, new TextEncoder().encode(message));
      setSignature(JSON.stringify(sig, null, 2));
    } catch (error) {
      console.error("Signing failed:", error);
      alert("Signing failed! Check console for details.");
    }
  };
  

  const handleVerify = async () => {
    if (!signature) {
      alert("No signature found! Sign a message first.");
      return;
    }
  
    const publicKeys = keyPairs.map((pair) => pair.publicKey);
    console.log("Public Keys:", publicKeys);
    console.log("Message:", message);
    console.log("Signature:", signature);
  
    try {
      const isValid = await verifySignature(
        JSON.parse(signature),
        publicKeys,
        new TextEncoder().encode(message)
      );
      setVerificationResult(isValid);
      console.log("Verification Result:", isValid);
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed! Check console for details.");
    }
  };
  
  
  const handleCheckLinkability = () => {
    console.log("Signature 1:", sig1);
    console.log("Signature 2:", sig2);
  
    if (!sig1.trim() || !sig2.trim()) {
      alert("Please enter both signatures to check linkability.");
      return;
    }
  
    try {
      const parsedSig1 = JSON.parse(sig1);
      const parsedSig2 = JSON.parse(sig2);
  
      console.log("Parsed Signature 1:", parsedSig1);
      console.log("Parsed Signature 2:", parsedSig2);
  
      const linked = checkLinkability(parsedSig1, parsedSig2);
      setLinkabilityResult(linked);
    } catch (error) {
      console.error("Linkability check failed:", error);
      alert("Invalid signature format! Check console for details.");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-700 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">🔐 LSAG E-Voting System</h2>

        {/* Generate Key Pair */}
        <div className="mb-6">
          <button 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:opacity-90 transition-all"
            onClick={handleGenerateKeyPair}
          >
            ➕ Generate Key Pair
          </button>
          <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto border border-gray-300 p-3 rounded-md bg-white">
            {keyPairs.map((key, index) => (
              <li key={index} className="text-sm text-gray-700">
                <strong>🔑 Public Key {index + 1}:</strong> {JSON.stringify(key.publicKey)}
              </li>
            ))}
          </ul>
        </div>

        {/* Sign a Message */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700">✍ Sign a Message:</h3>
          <input 
            type="text" 
            placeholder="Enter your message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-md mt-2 transition-all"
            onClick={handleSign}
          >
            ✅ Sign Message
          </button>

          {signature && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-md overflow-auto">
              <h3 className="text-lg font-medium text-gray-700">🔏 Generated Signature:</h3>
              <pre className="text-xs text-gray-800">{signature}</pre>
            </div>
          )}
        </div>

        {/* Verify Signature */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700">🔎 Verify Signature:</h3>
          <button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-md mt-2 transition-all"
            onClick={handleVerify}
          >
            🔍 Verify Signature
          </button>
          {verificationResult !== null && (
            <p className={`mt-2 text-lg font-bold ${verificationResult ? 'text-green-600' : 'text-red-600'}`}>
              {verificationResult ? '✅ Valid Signature' : '❌ Invalid Signature'}
            </p>
          )}
        </div>

        {/* Check Linkability */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-700">🔗 Check Linkability:</h3>

  <textarea
    value={sig1}
    onChange={(e) => setSig1(e.target.value)}
    placeholder="Paste first signature here..."
    className="w-full border border-gray-300 rounded-lg p-3 mt-2 focus:ring-2 focus:ring-purple-500"
  />

  <textarea
    value={sig2}
    onChange={(e) => setSig2(e.target.value)}
    placeholder="Paste second signature here..."
    className="w-full border border-gray-300 rounded-lg p-3 mt-2 focus:ring-2 focus:ring-purple-500"
  />

  <button 
    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-md mt-2 transition-all"
    onClick={handleCheckLinkability}
  >
    🔗 Check Linkability
  </button>

  {linkabilityResult !== null && (
    <p className={`mt-2 text-lg font-bold ${linkabilityResult ? 'text-orange-600' : 'text-blue-600'}`}>
      {linkabilityResult ? '🔗 Signatures are linked' : '🔍 Signatures are different'}
    </p>
  )}
</div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "keys" | "encrypt" | "shamir" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("keys");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // keys tab
  const [createKeyPayload, setCreateKeyPayload] = useState(
    JSON.stringify(
      { algorithm: "chacha20-poly1305", label: "my-app-key", rotation_days: 90 },
      null,
      2
    )
  );

  // encrypt tab
  const [encryptPayload, setEncryptPayload] = useState(
    JSON.stringify(
      { key_id: "key_01JXXXXXXXXXXXXXXXX", plaintext: "SGVsbG8gV29ybGQ=", algorithm: "chacha20-poly1305" },
      null,
      2
    )
  );
  const [decryptPayload, setDecryptPayload] = useState(
    JSON.stringify(
      { key_id: "key_01JXXXXXXXXXXXXXXXX", ciphertext: "base64EncodedCiphertext==" },
      null,
      2
    )
  );

  // shamir tab
  const [shamirSplitPayload, setShamirSplitPayload] = useState(
    JSON.stringify(
      { secret: "bXlfc3VwZXJfc2VjcmV0", threshold: 3, total_shares: 5 },
      null,
      2
    )
  );
  const [shamirRecoverPayload, setShamirRecoverPayload] = useState(
    JSON.stringify(
      {
        shares: [
          "share_1_base64==",
          "share_2_base64==",
          "share_3_base64==",
        ],
      },
      null,
      2
    )
  );

  async function post(path: string, body: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["keys", "encrypt", "shamir", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-Crypto-KMS / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* keys */}
      {tab === "keys" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/kms/keys/create — generate a new key with rotation policy
          </p>
          <textarea
            className="w-full h-36 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={createKeyPayload}
            onChange={(e) => setCreateKeyPayload(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => post("/api/v1/kms/keys/create", createKeyPayload)}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
            >
              {loading ? "Creating..." : "Create Key"}
            </button>
            <button
              onClick={() => get("/api/v1/kms/algorithms")}
              disabled={loading}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-green-300 text-sm font-semibold"
            >
              List Algorithms
            </button>
          </div>
        </div>
      )}

      {/* encrypt */}
      {tab === "encrypt" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/kms/encrypt — encrypt with ChaCha20-Poly1305 or AES-256-GCM
          </p>
          <textarea
            className="w-full h-36 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={encryptPayload}
            onChange={(e) => setEncryptPayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/kms/encrypt", encryptPayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Encrypting..." : "Encrypt"}
          </button>

          <p className="text-green-500 text-sm pt-2">
            POST /api/v1/kms/decrypt — decrypt an AEAD ciphertext
          </p>
          <textarea
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={decryptPayload}
            onChange={(e) => setDecryptPayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/kms/decrypt", decryptPayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Decrypting..." : "Decrypt"}
          </button>
        </div>
      )}

      {/* shamir */}
      {tab === "shamir" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/kms/shamir/split — split a secret into n shares (threshold k-of-n)
          </p>
          <textarea
            className="w-full h-36 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={shamirSplitPayload}
            onChange={(e) => setShamirSplitPayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/kms/shamir/split", shamirSplitPayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Splitting..." : "Split Secret"}
          </button>

          <p className="text-green-500 text-sm pt-2">
            POST /api/v1/kms/shamir/recover — recover secret from k shares
          </p>
          <textarea
            className="w-full h-36 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={shamirRecoverPayload}
            onChange={(e) => setShamirRecoverPayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/kms/shamir/recover", shamirRecoverPayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Recovering..." : "Recover Secret"}
          </button>
        </div>
      )}

      {/* stats */}
      {tab === "stats" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            GET /api/v1/kms/stats — key operations, encrypt/decrypt throughput, and Shamir usage
          </p>
          <button
            onClick={() => get("/api/v1/kms/stats")}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Loading..." : "Fetch Stats"}
          </button>
        </div>
      )}

      {/* result */}
      {result && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Response</p>
          <pre className="bg-gray-800 border border-gray-700 rounded p-4 text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

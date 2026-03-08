import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <span className="text-green-400 font-mono font-bold text-lg tracking-wide">
          ALICE-Crypto-KMS
        </span>
        <Link
          href="/dashboard/console"
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-semibold transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <span className="text-green-400 font-mono text-sm uppercase tracking-widest mb-4">
          Project A.L.I.C.E.
        </span>
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Cryptographic<br />
          <span className="text-green-400">Key Management</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mb-10">
          ChaCha20-Poly1305 and AES-256-GCM AEAD encryption, Shamir Secret
          Sharing with k-of-n threshold recovery, and automated key rotation —
          all with information-theoretic security guarantees.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/console"
            className="px-7 py-3 bg-green-700 hover:bg-green-600 rounded-lg font-semibold text-lg transition-colors"
          >
            Open Console
          </Link>
          <a
            href="#features"
            className="px-7 py-3 border border-gray-700 hover:border-green-500 rounded-lg font-semibold text-lg text-gray-300 hover:text-white transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14 text-green-300">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">AEAD Encryption</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ChaCha20-Poly1305 and AES-256-GCM authenticated encryption
              with associated data. Both algorithms provide confidentiality
              and integrity in a single pass — no separate MAC required.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">🧩</div>
            <h3 className="text-xl font-bold mb-2">Shamir Secret Sharing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Split any secret into n shares with a k-of-n recovery threshold.
              Information-theoretically secure — an attacker with fewer than
              k shares learns nothing about the original secret.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Key Management + Rotation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Create keys with configurable rotation policies, track usage
              per key ID, and automate rotation on a schedule. All key material
              is wrapped with an envelope encryption scheme.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        ALICE-Crypto-KMS — Project A.L.I.C.E. &mdash; AGPL-3.0-or-later
      </footer>
    </div>
  );
}

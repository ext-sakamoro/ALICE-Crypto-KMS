# ALICE-Crypto-KMS

Cryptographic Key Management Service built on Project A.L.I.C.E. —
ChaCha20-Poly1305 and AES-256-GCM AEAD encryption, Shamir Secret Sharing
with k-of-n threshold recovery, automated key rotation, and information-theoretic
security guarantees through a single REST API.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│           Landing Page  │  Dashboard Console            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│               KMS API (Rust / Axum)                     │
│  /keys/create  /encrypt  /decrypt                       │
│  /shamir/split  /shamir/recover  /algorithms  /stats    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│             ALICE-Crypto Engine (Rust)                  │
│  ChaCha20-Poly1305 AEAD  │  AES-256-GCM AEAD           │
│  Shamir Secret Sharing   │  Key Rotation Scheduler     │
│  Envelope Encryption     │  HKDF Key Derivation        │
└─────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| ChaCha20-Poly1305 | IETF-standard AEAD — preferred for software implementations |
| AES-256-GCM | Hardware-accelerated AEAD for AES-NI capable CPUs |
| Shamir Secret Sharing | k-of-n threshold splitting with GF(2^8) arithmetic |
| Information-Theoretic Security | Fewer than k shares reveals zero information |
| Key Rotation | Automated rotation with configurable interval and re-wrap |
| HKDF Key Derivation | Derive per-purpose subkeys from a single root key |
| Envelope Encryption | Data keys wrapped by root keys — minimal key exposure |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/kms/keys/create` | Generate a new cryptographic key |
| POST | `/api/v1/kms/encrypt` | Encrypt plaintext with a named key |
| POST | `/api/v1/kms/decrypt` | Decrypt a ciphertext with a named key |
| POST | `/api/v1/kms/shamir/split` | Split a secret into n shares (threshold k) |
| POST | `/api/v1/kms/shamir/recover` | Recover a secret from k or more shares |
| GET | `/api/v1/kms/algorithms` | List supported algorithms and their properties |
| GET | `/api/v1/kms/stats` | Key operation counts and throughput metrics |

## Quick Start

```bash
# Clone and start the backend
git clone https://github.com/ext-sakamoro/ALICE-Crypto-KMS
cd ALICE-Crypto-KMS
cargo build --release
./target/release/alice-kms-server

# In a separate terminal, start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Create key example

```bash
curl -X POST http://localhost:8081/api/v1/kms/keys/create \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"chacha20-poly1305","label":"my-app-key","rotation_days":90}'
```

### Encrypt / Decrypt example

```bash
# Encrypt
curl -X POST http://localhost:8081/api/v1/kms/encrypt \
  -H "Content-Type: application/json" \
  -d '{"key_id":"key_01J...","plaintext":"SGVsbG8gV29ybGQ=","algorithm":"chacha20-poly1305"}'

# Decrypt
curl -X POST http://localhost:8081/api/v1/kms/decrypt \
  -H "Content-Type: application/json" \
  -d '{"key_id":"key_01J...","ciphertext":"base64EncodedCiphertext=="}'
```

### Shamir Secret Sharing example

```bash
# Split (3-of-5)
curl -X POST http://localhost:8081/api/v1/kms/shamir/split \
  -H "Content-Type: application/json" \
  -d '{"secret":"bXlfc3VwZXJfc2VjcmV0","threshold":3,"total_shares":5}'

# Recover with any 3 shares
curl -X POST http://localhost:8081/api/v1/kms/shamir/recover \
  -H "Content-Type: application/json" \
  -d '{"shares":["share1==","share2==","share3=="]}'
```

## License

AGPL-3.0-or-later — see [LICENSE](./LICENSE)

//! ALICE Crypto KMS — core engine
//!
//! # 実装状況 (2026-09-27)
//!
//! **鍵管理と暗号処理は未実装** `/health` と `/api/v1/kms/stats` 以外の
//! endpoint は `501 Not Implemented` を返す
//!
//! 2026-09-27 まで、これらの endpoint は動作しているように見える応答を
//! 返していたが中身はフェイクだった:
//!
//! - `encrypt` — FNV-1a hash を hex 整形して `ciphertext` / `nonce` / `tag`
//!   として返し、`algorithm` に `"chacha20-poly1305"` と申告していた
//!   (暗号化は一切行われていない)
//! - `decrypt` — 入力の `ciphertext` / `nonce` / `tag` / `aad` を読まず、
//!   固定文字列 `"[decrypted content]"` を返して `verified: true` と申告
//! - `create_key` — 鍵素材を生成も保存もせず UUID と固定 timestamp を返す
//! - `shamir/split` — Shamir の秘密分散ではなく FNV-1a 由来の文字列を share
//!   として返す (threshold 個集めても復元できない)
//! - `shamir/recover` — share の**個数だけ**見て固定文字列を返す
//! - `algorithms` — 未実装の AEAD 3 方式を利用可能として広告
//!
//! KMS がこの状態で本番に出ると「暗号化されていないデータを暗号化済と
//! 誤認する」ため、嘘の応答をやめて fail fast にした
//! (CLAUDE.md § 仮実装完了偽装の禁止ルール)
//!
//! 本実装は `alice-crypto` の AEAD を wire する形で別途行う

use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState {
    start_time: Instant,
    stats: Mutex<Stats>,
}

/// 実処理が未実装なので、暗号処理系の counter は常に 0 のままになる
/// (`stats` endpoint が 0 を返すのは「使われていない」ではなく「未実装」)
struct Stats {
    total_encryptions: u64,
    total_decryptions: u64,
    total_keys_created: u64,
    total_shares_split: u64,
    bytes_encrypted: u64,
}

#[derive(Serialize)]
struct Health {
    status: String,
    version: String,
    uptime_secs: u64,
    total_ops: u64,
}

#[derive(Serialize)]
struct StatsResponse {
    total_encryptions: u64,
    total_decryptions: u64,
    total_keys_created: u64,
    total_shares_split: u64,
    bytes_encrypted: u64,
}

#[derive(Serialize)]
struct NotImplemented {
    error: &'static str,
    detail: &'static str,
    endpoint: &'static str,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "crypto_engine=info".into()),
        )
        .init();
    let state = Arc::new(AppState {
        start_time: Instant::now(),
        stats: Mutex::new(Stats {
            total_encryptions: 0,
            total_decryptions: 0,
            total_keys_created: 0,
            total_shares_split: 0,
            bytes_encrypted: 0,
        }),
    });
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        // 未実装 (2026-09-27): 404 ではなく 501 を返して「route はあるが
        // 機能が無い」ことを client に明示する
        .route("/api/v1/kms/keys/create", post(create_key))
        .route("/api/v1/kms/encrypt", post(encrypt))
        .route("/api/v1/kms/decrypt", post(decrypt))
        .route("/api/v1/kms/shamir/split", post(shamir_split))
        .route("/api/v1/kms/shamir/recover", post(shamir_recover))
        .route("/api/v1/kms/algorithms", get(algorithms))
        .route("/api/v1/kms/stats", get(stats))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);
    let addr = std::env::var("CRYPTO_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::warn!(
        "Crypto KMS Engine on {addr} — key management and crypto operations are NOT implemented; \
         every endpoint except /health and /api/v1/kms/stats returns 501"
    );
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        uptime_secs: s.start_time.elapsed().as_secs(),
        total_ops: st.total_encryptions + st.total_decryptions + st.total_keys_created,
    })
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse {
        total_encryptions: st.total_encryptions,
        total_decryptions: st.total_decryptions,
        total_keys_created: st.total_keys_created,
        total_shares_split: st.total_shares_split,
        bytes_encrypted: st.bytes_encrypted,
    })
}

/// 未実装 endpoint の共通応答 request body は読まない (読んだところで
/// 処理できないため、部分的に処理したように見せない)
fn not_implemented(
    endpoint: &'static str,
    detail: &'static str,
) -> (StatusCode, Json<NotImplemented>) {
    (
        StatusCode::NOT_IMPLEMENTED,
        Json(NotImplemented {
            error: "not_implemented",
            detail,
            endpoint,
        }),
    )
}

async fn create_key() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/keys/create",
        "key generation and storage are not implemented; no key material is created",
    )
}

async fn encrypt() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/encrypt",
        "AEAD encryption is not implemented; this endpoint previously returned an FNV-1a hash \
         labelled as chacha20-poly1305 ciphertext",
    )
}

async fn decrypt() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/decrypt",
        "AEAD decryption and tag verification are not implemented; this endpoint previously \
         returned a fixed placeholder string with verified = true",
    )
}

async fn shamir_split() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/shamir/split",
        "Shamir secret sharing is not implemented; the previous shares were FNV-1a derived \
         strings that could not reconstruct the secret",
    )
}

async fn shamir_recover() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/shamir/recover",
        "Shamir reconstruction is not implemented; the previous response only counted the shares",
    )
}

async fn algorithms() -> (StatusCode, Json<NotImplemented>) {
    not_implemented(
        "/api/v1/kms/algorithms",
        "no AEAD algorithm is implemented, so none can be advertised as available",
    )
}

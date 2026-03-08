-- ALICE Crypto KMS: Domain-specific tables
CREATE TABLE IF NOT EXISTS kms_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    algorithm TEXT NOT NULL DEFAULT 'chacha20-poly1305' CHECK (algorithm IN ('chacha20-poly1305', 'aes-256-gcm', 'xchacha20-poly1305')),
    key_size INTEGER NOT NULL DEFAULT 256,
    purpose TEXT NOT NULL DEFAULT 'encrypt-decrypt' CHECK (purpose IN ('encrypt-decrypt', 'sign-verify', 'wrap-unwrap')),
    rotation_days INTEGER NOT NULL DEFAULT 90,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'scheduled-deletion', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    rotated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS kms_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES kms_keys(id) ON DELETE CASCADE,
    operation TEXT NOT NULL CHECK (operation IN ('encrypt', 'decrypt', 'sign', 'verify', 'wrap', 'unwrap')),
    input_size_bytes BIGINT NOT NULL DEFAULT 0,
    elapsed_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kms_shamir_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    total_shares SMALLINT NOT NULL,
    threshold SMALLINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovered', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kms_keys_user ON kms_keys(user_id);
CREATE INDEX idx_kms_operations_key ON kms_operations(key_id, created_at);
CREATE INDEX idx_kms_shamir_user ON kms_shamir_splits(user_id);

import crypto from "crypto";

// ── Config ────────────────────────────────────────────────────────────────────
// All values come from environment variables — never hardcode credentials.

export const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID!;
export const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!;
export const PAYFAST_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE;   // optional but recommended

const IS_SANDBOX = process.env.NODE_ENV !== "production";

export const PAYFAST_URL = IS_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

// ── Signature ─────────────────────────────────────────────────────────────────

/**
 * Build the MD5 signature PayFast requires.
 * Parameters are sorted alphabetically, URL-encoded (spaces as "+"),
 * and the merchant passphrase is appended last if set.
 */
export function buildPayFastSignature(
  params: Record<string, string>,
  passphrase?: string,
): string {
  const queryString = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== "")
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  const toHash = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  return crypto.createHash("md5").update(toHash).digest("hex");
}

// ── Verification ──────────────────────────────────────────────────────────────

/**
 * Verify an incoming ITN payload.
 * Remove the `signature` key, rebuild the hash, and compare.
 */
export function verifyPayFastSignature(
  itnParams: Record<string, string>,
  passphrase?: string,
): boolean {
  const { signature, ...rest } = itnParams;
  const expected = buildPayFastSignature(rest, passphrase);
  return expected === signature;
}

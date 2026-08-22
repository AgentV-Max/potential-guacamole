import { randomUUID } from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY;
}

/** True once a real Paystack secret key is configured; false runs the app in mock/test payment mode. */
export function isPaystackConfigured(): boolean {
  return Boolean(getSecretKey());
}

async function paystackRequest<T>(
  path: string,
  init: RequestInit
): Promise<T> {
  const secret = getSecretKey();
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data.message || `Paystack request to ${path} failed`);
  }
  return data.data as T;
}

export type InitializeResult = {
  provider: "mock" | "paystack";
  reference: string;
  authorizationUrl: string | null;
};

/**
 * Starts a checkout for the given order. In mock mode (no PAYSTACK_SECRET_KEY)
 * this just mints a reference the client completes via /api/payments/mock-complete,
 * so the full escrow flow is testable without a Paystack account.
 */
export async function initializeCheckout(params: {
  email: string;
  amountNaira: number;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<InitializeResult> {
  if (!isPaystackConfigured()) {
    return {
      provider: "mock",
      reference: `MOCK-${randomUUID()}`,
      authorizationUrl: null,
    };
  }

  const data = await paystackRequest<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amountNaira * 100),
        callback_url: params.callbackUrl,
        currency: "NGN",
        metadata: params.metadata,
      }),
    }
  );

  return {
    provider: "paystack",
    reference: data.reference,
    authorizationUrl: data.authorization_url,
  };
}

export type VerifyResult = { success: boolean; reference: string; amountKobo: number };

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const data = await paystackRequest<{ status: string; amount: number; reference: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" }
  );
  return {
    success: data.status === "success",
    reference: data.reference,
    amountKobo: data.amount,
  };
}

/** Creates (or reuses) a Paystack transfer recipient for a seller's payout bank account. */
export async function ensureTransferRecipient(seller: {
  bank_account_name: string;
  bank_account_number: string;
  bank_code: string;
}): Promise<string> {
  const data = await paystackRequest<{ recipient_code: string }>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: seller.bank_account_name,
      account_number: seller.bank_account_number,
      bank_code: seller.bank_code,
      currency: "NGN",
    }),
  });
  return data.recipient_code;
}

export async function payoutToSeller(params: {
  recipientCode: string;
  amountNaira: number;
  reason: string;
}): Promise<{ transferCode: string; status: string }> {
  const data = await paystackRequest<{ transfer_code: string; status: string }>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(params.amountNaira * 100),
      recipient: params.recipientCode,
      reason: params.reason,
      currency: "NGN",
    }),
  });
  return { transferCode: data.transfer_code, status: data.status };
}

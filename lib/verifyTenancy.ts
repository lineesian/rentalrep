import { createServiceClient } from "@/lib/supabase/service";

export interface VerifyTenancyParams {
  tenantName:       string;
  landlordName:     string;
  propertyAddress:  string;
  leaseStartDate:   string; // ISO date "YYYY-MM-DD"
  leaseEndDate:     string; // ISO date "YYYY-MM-DD"
}

/**
 * Checks whether a matching private lease record exists.
 * Uses the service role — never called client-side.
 * Returns true if a match is found, false otherwise.
 * When matched, marks the record so duplicate verifications can be tracked.
 */
export async function verifyTenancy(params: VerifyTenancyParams): Promise<boolean> {
  const { tenantName, landlordName, propertyAddress, leaseStartDate, leaseEndDate } = params;

  const svc = createServiceClient();

  // Fetch all records that match on normalised names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: records, error } = await (svc as any)
    .from("private_lease_records")
    .select("id, property_address, lease_start_date, lease_end_date")
    .ilike("tenant_full_name", tenantName.trim())
    .ilike("landlord_full_name", landlordName.trim());

  if (error || !records || records.length === 0) return false;

  const submittedStart = new Date(leaseStartDate).getTime();
  const submittedEnd   = new Date(leaseEndDate).getTime();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  // First word of submitted address for partial matching
  const submittedFirstWord = propertyAddress.trim().split(/\s+/)[0].toLowerCase();

  for (const record of records as Array<{
    id: string;
    property_address: string;
    lease_start_date: string;
    lease_end_date: string;
  }>) {
    // Check first word of stored address
    const storedFirstWord = record.property_address.trim().split(/\s+/)[0].toLowerCase();
    if (storedFirstWord !== submittedFirstWord) continue;

    // Check 30-day date overlap
    const storedStart = new Date(record.lease_start_date).getTime();
    const storedEnd   = new Date(record.lease_end_date).getTime();

    const overlaps =
      submittedStart <= storedEnd   + THIRTY_DAYS_MS &&
      submittedEnd   >= storedStart - THIRTY_DAYS_MS;

    if (!overlaps) continue;

    // Match found — mark it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (svc as any)
      .from("private_lease_records")
      .update({ matched: true })
      .eq("id", record.id);

    return true;
  }

  return false;
}

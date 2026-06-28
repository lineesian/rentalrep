import { NextRequest, NextResponse } from "next/server";
import { createClient }        from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTenancy }       from "@/lib/verifyTenancy";

export const dynamic = "force-dynamic";

/**
 * POST /api/verify-tenancy
 *
 * Body: { revieweeId?, revieweeName, reviewerRole, propertyAddress, leaseStart, leaseEnd }
 *
 * Determines which party is the tenant and which is the landlord,
 * then queries private_lease_records via service role.
 * Returns { verified: boolean } — never returns any record data.
 */
export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ verified: false }, { status: 401 });

  let body: {
    revieweeName:    string;
    reviewerRole:    string;
    propertyAddress: string;
    leaseStart:      string;
    leaseEnd:        string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const { revieweeName, reviewerRole, propertyAddress, leaseStart, leaseEnd } = body;
  if (!revieweeName || !reviewerRole || !propertyAddress || !leaseStart || !leaseEnd) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  // Look up reviewer's own name via service role
  const svc = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviewerProfile } = await (svc as any)
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const reviewerName: string = reviewerProfile?.full_name ?? "";

  // Determine who is tenant and who is landlord
  let tenantName:   string;
  let landlordName: string;

  if (reviewerRole === "tenant") {
    // Tenant is writing the review — reviewee is the landlord
    tenantName   = reviewerName;
    landlordName = revieweeName;
  } else {
    // Landlord or agency is writing — reviewee is the tenant
    tenantName   = revieweeName;
    landlordName = reviewerName;
  }

  if (!tenantName || !landlordName) {
    return NextResponse.json({ verified: false });
  }

  const verified = await verifyTenancy({
    tenantName,
    landlordName,
    propertyAddress,
    leaseStartDate: leaseStart,
    leaseEndDate:   leaseEnd,
  });

  return NextResponse.json({ verified });
}

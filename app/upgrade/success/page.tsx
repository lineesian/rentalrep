import { createClient } from "@/lib/supabase/server";
import { redirect }     from "next/navigation";
import Link             from "next/link";
import { tierName }     from "@/lib/plans";
import type { SubscriptionTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function UpgradeSuccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("subscription_tier, full_name")
    .eq("id", user.id)
    .single();

  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;
  const name = tierName(tier);

  return (
    <div className="screen bg-petrol-400 flex flex-col items-center justify-center px-6 text-center">
      {/* Success ring */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "rgba(47,212,192,0.15)", border: "2px solid #2FD4C0" }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#2FD4C0" strokeWidth={1.8}/>
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#2FD4C0" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="font-heading font-bold text-2xl text-white mb-2">
        You&apos;re now on {name}
      </h1>
      <p className="text-sm text-mint-300 font-body leading-relaxed mb-2 max-w-xs">
        Welcome to RentalRep Pro. Your new features are active immediately.
      </p>

      {/* Plan badge */}
      <span
        className="inline-flex items-center gap-2 text-sm font-semibold font-heading px-4 py-2 rounded-full mb-10"
        style={{ backgroundColor: "#F5C842", color: "#0D2B2A" }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1.5l1.9 4.8h5.1L11 9.3l1.6 4.9L8 11.5 3.4 14.2 5 9.3.9 6.3H6L8 1.5z" stroke="#0D2B2A" strokeWidth="1.3" fill="#0D2B2A" strokeLinejoin="round"/>
        </svg>
        {name} active
      </span>

      <Link
        href="/home"
        className="w-full max-w-xs py-3.5 rounded-xl font-heading font-bold text-sm text-center block"
        style={{ backgroundColor: "#0E9E92", color: "#ffffff" }}
      >
        Go to Home
      </Link>

      <Link
        href="/upgrade"
        className="mt-3 text-xs text-mint-300 font-body underline-offset-2 hover:underline"
      >
        View plan details
      </Link>
    </div>
  );
}

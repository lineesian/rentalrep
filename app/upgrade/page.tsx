import { createClient }  from "@/lib/supabase/server";
import { redirect }      from "next/navigation";
import { plansForRole }  from "@/lib/plans";
import type { Plan }     from "@/lib/plans";
import { BottomNav }     from "@/components/layout/BottomNav";
import { UpgradeCard }   from "@/components/ui/UpgradeCard";

export const dynamic = "force-dynamic";

// ── Feature list icon (checkmark) ─────────────────────────────────────────────

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" stroke="#2FD4C0" strokeWidth="1.4"/>
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#2FD4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrent,
  isRecommended,
}: {
  plan: Plan;
  isCurrent: boolean;
  isRecommended: boolean;
}) {
  const isFree = plan.id === "free";

  return (
    <div
      className={`rounded-3xl border-2 p-6 flex flex-col ${
        isRecommended
          ? "border-gold-400 bg-petrol-400"
          : "border-teal-400/20 bg-petrol-400/95"
      }`}
      style={{
        background: isRecommended
          ? "linear-gradient(145deg,#0a2825 0%,#07312C 100%)"
          : "#07312C",
      }}
    >
      {/* Recommended ribbon */}
      {isRecommended && (
        <div className="flex justify-start mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold font-body px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#F5C842", color: "#0D2B2A" }}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5l1.9 4.8h5.1L11 9.3l1.6 4.9L8 11.5 3.4 14.2 5 9.3.9 6.3H6L8 1.5z" stroke="#0D2B2A" strokeWidth="1.3" fill="#0D2B2A" strokeLinejoin="round"/>
            </svg>
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name + price */}
      <p className="font-heading font-bold text-lg text-white mb-0.5">{plan.name}</p>
      <p
        className="font-heading font-bold text-3xl mb-4"
        style={{ color: isRecommended ? "#F5C842" : "#2FD4C0" }}
      >
        {plan.price}
      </p>

      {/* Feature list */}
      <ul className="flex-1 space-y-2.5 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-mint-300 font-body leading-snug">
            <Check />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div className="w-full py-3 rounded-xl border-2 border-teal-400/30 text-center text-sm font-semibold font-heading text-teal-400/60">
          Current Plan
        </div>
      ) : isFree ? (
        <div className="w-full py-3 rounded-xl border-2 border-white/10 text-center text-sm font-semibold font-heading text-white/40">
          Free Forever
        </div>
      ) : (
        /* Client component handles the Stripe redirect */
        <UpgradeCard priceId={plan.priceId} label={`Upgrade to ${plan.name}`} recommended={isRecommended} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role, subscription_tier")
    .eq("id", user.id)
    .single();

  const role    = (profile?.role ?? "tenant") as string;
  const current = (profile?.subscription_tier ?? "free") as string;
  const plans   = plansForRole(role);

  // Recommended plan = first paid plan visible to this role
  const recommended = plans.find((p) => p.id !== "free")?.id ?? "";

  return (
    <div className="screen bg-petrol-400">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <p className="text-mint-300 text-xs font-semibold tracking-widest uppercase font-body mb-2">
          Pricing
        </p>
        <h1 className="font-heading font-bold text-3xl text-white leading-tight mb-2">
          Upgrade your<br />RentalRep plan
        </h1>
        <p className="text-sm text-mint-300 font-body leading-relaxed">
          Get more from your rental reputation — verified, trusted, powerful.
        </p>
      </div>

      {/* Plan cards */}
      <div className="px-4 pb-28 space-y-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === current}
            isRecommended={plan.id === recommended}
          />
        ))}
      </div>

      <BottomNav profileId={user.id} />
    </div>
  );
}

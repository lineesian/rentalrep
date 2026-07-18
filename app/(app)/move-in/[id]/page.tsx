import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { ShareLink } from "./ShareLink";

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function MoveInReportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: report } = await (supabase as any)
    .from("move_in_reports")
    .select("*, move_in_report_photos(*)")
    .eq("id", params.id)
    .single();

  if (!report) redirect("/home");

  const isOwner   = report.tenant_id === user.id;
  const isLandlord = report.landlord_id === user.id;
  if (!isOwner && !isLandlord) redirect("/home");

  const rooms = Array.from(
    new Set((report.move_in_report_photos ?? []).map((p: any) => p.room_label as string))
  ) as string[];

  return (
    <div className="min-h-screen bg-[#F5F8F7] pb-24">
      {/* header */}
      <div className="bg-white border-b border-[#E6EFED] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#0E9E92] text-sm font-medium">← Home</Link>
          <h1 className="font-heading font-bold text-[#07312C] text-lg">Move-in report</h1>
        </div>
        {isLandlord && !report.landlord_acknowledged_at && (
          <AcknowledgeButton reportId={report.id} />
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* summary card */}
        <div className="bg-[#07312C] rounded-2xl p-5">
          <p className="text-[#2FD4C0] text-xs font-semibold uppercase tracking-wide mb-1">Property</p>
          <p className="text-white font-heading font-bold text-lg leading-snug">{report.property_address}</p>
          <p className="text-[#A0C4BF] text-sm mt-1">
            {report.guest_landlord_name ?? "Landlord on RentalRep"}
          </p>
          <p className="text-[#5E9992] text-xs mt-2">
            Documented {fmt(report.created_at)}
          </p>
          {report.landlord_acknowledged_at ? (
            <div className="mt-3 bg-[#EAFAF4] rounded-xl px-3 py-2 inline-block">
              <p className="text-xs font-semibold text-[#065F46]">
                Acknowledged by landlord {fmt(report.landlord_acknowledged_at)}
              </p>
            </div>
          ) : (
            <div className="mt-3 bg-[#FEF3C7] rounded-xl px-3 py-2 inline-block">
              <p className="text-xs font-semibold text-[#92400E]">Pending landlord acknowledgement</p>
            </div>
          )}
        </div>

        {/* share link for tenants */}
        {isOwner && <ShareLink reportId={report.id} landlordEmail={report.guest_landlord_email} />}

        {/* room-by-room photos */}
        {rooms.map((room) => {
          const roomPhotos = (report.move_in_report_photos ?? []).filter(
            (p: any) => p.room_label === room,
          );
          return (
            <div key={room} className="bg-white rounded-2xl p-4 space-y-3">
              <h2 className="font-heading font-semibold text-[#07312C] text-sm">{room}</h2>
              {roomPhotos.map((p: any) => (
                <div key={p.id} className="space-y-1">
                  <a
                    href={p.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#F5F8F7] rounded-xl overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photo_url}
                      alt={p.caption ?? room}
                      className="w-full max-h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </a>
                  <p className="text-xs text-[#5E7470]">
                    {p.caption && <span className="italic">{p.caption} · </span>}
                    {fmt(p.taken_at)}
                  </p>
                </div>
              ))}
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-sm text-[#5E7470]">No photos in this report yet.</p>
            {isOwner && (
              <Link
                href={`/move-in/${report.id}/add-photo`}
                className="text-[#0E9E92] text-sm font-semibold mt-1 inline-block"
              >
                Add photos
              </Link>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

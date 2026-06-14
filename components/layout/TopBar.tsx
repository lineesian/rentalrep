import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

interface TopBarProps {
  title?: string;
  backHref?: string;
  showLogo?: boolean;
  right?: React.ReactNode;
}

export function TopBar({ title, backHref, showLogo, right }: TopBarProps) {
  return (
    <div className="bg-petrol-400 px-5 pt-12 pb-5">
      {backHref && (
        <Link href={backHref} className="text-teal-400 text-xl block mb-3" aria-label="Go back">
          ←
        </Link>
      )}
      <div className="flex items-center justify-between">
        {showLogo ? (
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <div>
              <p className="font-heading font-bold text-lg text-white leading-none">RentalRep</p>
              <p className="text-[10px] text-teal-400 font-medium tracking-wide mt-0.5">
                Rate. Trust. Rent with Confidence.
              </p>
            </div>
          </div>
        ) : (
          <h1 className="font-heading font-bold text-xl text-white">{title}</h1>
        )}
        {right}
      </div>
    </div>
  );
}

import { ShieldCheck, Crown } from "lucide-react";
import type { WorkerMembershipType } from "@workspace/api-client-react/src/generated/api.schemas";

interface MembershipBadgeProps {
  type: WorkerMembershipType;
  className?: string;
}

export function MembershipBadge({ type, className = "" }: MembershipBadgeProps) {
  if (type === "free") return null;

  if (type === "premium") {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} title="Verified Premium">
        <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-100" />
      </span>
    );
  }

  if (type === "premium_plus") {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} title="Premium Plus">
        <Crown className="w-4 h-4 text-amber-500 fill-amber-100" />
      </span>
    );
  }

  return null;
}

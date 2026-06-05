import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MembershipBadge } from "@/components/worker/MembershipBadge";

export default function CheckoutSuccess() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");
  const workerId = params.get("worker_id");
  const membership = params.get("membership");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId || !workerId || !membership) {
      setStatus("error");
      setErrorMsg("Missing payment information.");
      return;
    }

    const url = `/api/stripe/verify-session?session_id=${sessionId}&worker_id=${workerId}&membership=${membership}`;
    fetch(url)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Verification failed");
        setStatus("success");
      })
      .catch(err => {
        setStatus("error");
        setErrorMsg(err.message);
      });
  }, [sessionId, workerId, membership]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      {status === "loading" && (
        <Card>
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Confirming your payment...</p>
          </CardContent>
        </Card>
      )}

      {status === "success" && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Your new membership:</span>
              <MembershipBadge type={(membership as any) ?? "premium"} />
            </div>
            <p className="text-sm text-muted-foreground">
              You now appear higher in search results and have a verified badge on your profile.
            </p>
            <Button className="mt-2 w-full" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-400" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

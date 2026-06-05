import { useState } from "react";
import {
  useGetWorker,
  useUpdateWorker,
  useUpdateWorkerAvailability,
  useListCategories,
  getGetWorkerQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Star, User, Settings, ArrowUpCircle, Crown, ShieldCheck, Loader2 } from "lucide-react";
import { MembershipBadge } from "@/components/worker/MembershipBadge";
import { useToast } from "@/hooks/use-toast";

const WORKER_ID = 1;

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = getGetWorkerQueryKey(WORKER_ID);

  const { data: worker, isLoading } = useGetWorker(WORKER_ID, {
    query: { enabled: true, queryKey },
  });

  const { data: categories } = useListCategories();
  const updateWorker = useUpdateWorker();
  const updateAvailability = useUpdateWorkerAvailability();

  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    profession: "",
    category: "",
    area: "",
    bio: "",
  });

  const openEdit = () => {
    if (!worker) return;
    setForm({
      name: worker.name,
      phone: worker.phone,
      profession: worker.profession,
      category: worker.category,
      area: worker.area ?? "",
      bio: worker.bio ?? "",
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    updateWorker.mutate(
      { id: WORKER_ID, data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey });
          setEditOpen(false);
          toast({ title: "Profile updated!", description: "Your changes have been saved." });
        },
        onError: () => {
          toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    updateAvailability.mutate({ id: WORKER_ID, data: { isAvailable: checked } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });
  };

  const handleUpgrade = async (membershipType: string) => {
    setCheckoutLoading(membershipType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: WORKER_ID, membershipType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Payment error", description: err.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading dashboard...</div>;
  if (!worker) return <div className="p-12 text-center">No profile found. Please register.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your KashWork presence</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={openEdit}>
          <Settings className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-card to-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-card">
              {worker.photoUrl ? (
                <img src={worker.photoUrl} alt={worker.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                {worker.name}
                <MembershipBadge type={worker.membershipType} />
              </h2>
              <p className="text-muted-foreground font-medium">{worker.profession}</p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
                  <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
                  {worker.averageRating.toFixed(1)} Rating
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
                  {worker.totalRatings} Reviews
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Status</CardTitle>
            <CardDescription>Are you taking jobs right now?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
              <div className="space-y-0.5">
                <Label htmlFor="availability" className="text-base font-semibold">Available</Label>
                <p className="text-xs text-muted-foreground">Show in search results</p>
              </div>
              <Switch
                id="availability"
                checked={worker.isAvailable}
                onCheckedChange={handleAvailabilityToggle}
                disabled={updateAvailability.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl border bg-muted/30 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-foreground capitalize">
                  {worker.membershipType.replace("_", " ")} Plan
                </span>
                <MembershipBadge type={worker.membershipType} />
              </div>
              <p className="text-sm text-muted-foreground">
                {worker.membershipType === "free"
                  ? "Standard visibility in search results."
                  : "Boosted visibility and verified badge."}
              </p>
            </div>

            {worker.membershipType === "free" && (
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                onClick={() => setUpgradeOpen(true)}
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" /> Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-6">
              Your recent reviews and profile views will appear here.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Profession / Job Title</Label>
              <Input value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Area / Locality</Label>
                <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell customers about yourself..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateWorker.isPending}>
              {updateWorker.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade to Premium Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Membership</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Get a verified badge and appear higher in search results. Customers can pay via card, UPI, and more.
            </p>

            <div className="rounded-xl border p-4 space-y-3 hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Premium</span>
                </div>
                <span className="text-lg font-bold">₹499 <span className="text-sm font-normal text-muted-foreground">once</span></span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Blue verified badge</li>
                <li>✓ Priority in search results</li>
                <li>✓ More job requests</li>
              </ul>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={checkoutLoading !== null}
                onClick={() => handleUpgrade("premium")}
              >
                {checkoutLoading === "premium" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Pay ₹499 — Get Premium
              </Button>
            </div>

            <div className="rounded-xl border p-4 space-y-3 hover:border-amber-400 transition-colors bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">Premium Plus</span>
                  <Badge className="bg-amber-500 text-white text-xs">Best Value</Badge>
                </div>
                <span className="text-lg font-bold">₹899 <span className="text-sm font-normal text-muted-foreground">once</span></span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Gold crown badge</li>
                <li>✓ Top of search results</li>
                <li>✓ Featured on home page</li>
                <li>✓ WhatsApp job alerts</li>
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                disabled={checkoutLoading !== null}
                onClick={() => handleUpgrade("premium_plus")}
              >
                {checkoutLoading === "premium_plus" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Pay ₹899 — Get Premium Plus
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Stripe · Card, UPI, Net Banking accepted
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

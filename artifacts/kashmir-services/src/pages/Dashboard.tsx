import { useGetWorker, useUpdateWorkerAvailability, getGetWorkerQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star, User, Settings, ArrowUpCircle } from "lucide-react";
import { MembershipBadge } from "@/components/worker/MembershipBadge";

export default function Dashboard() {
  // Hardcoded for demo purposes (in reality, get from auth context)
  const workerId = 1;
  
  const { data: worker, isLoading } = useGetWorker(workerId, {
    query: { enabled: true, queryKey: getGetWorkerQueryKey(workerId) }
  });
  
  const updateAvailability = useUpdateWorkerAvailability();

  if (isLoading) return <div className="p-12 text-center">Loading dashboard...</div>;
  if (!worker) return <div className="p-12 text-center">No profile found. Please register.</div>;

  const handleAvailabilityToggle = (checked: boolean) => {
    updateAvailability.mutate({
      id: workerId,
      data: { isAvailable: checked }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your KashWork presence</p>
        </div>
        <Button variant="outline" className="gap-2">
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
                <span className="font-medium text-foreground capitalize">{worker.membershipType.replace('_', ' ')} Plan</span>
                <MembershipBadge type={worker.membershipType} />
              </div>
              <p className="text-sm text-muted-foreground">
                {worker.membershipType === 'free' 
                  ? "Standard visibility in search results." 
                  : "Boosted visibility and verified badge."}
              </p>
            </div>
            
            {worker.membershipType === 'free' && (
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
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
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-6">
                Your recent reviews and profile views will appear here.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

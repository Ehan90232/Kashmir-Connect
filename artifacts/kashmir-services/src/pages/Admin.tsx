import { useState } from "react";
import {
  useGetStatsSummary, useListWorkers, useUpdateWorkerMembership, useDeleteWorker,
  useListJobRequests, useUpdateJobRequestStatus,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, ShieldCheck, CheckCircle2, Briefcase, Phone } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  assigned: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function Admin() {
  const { data: stats } = useGetStatsSummary();
  const { data: workers, refetch: refetchWorkers } = useListWorkers();
  const { data: jobRequests, refetch: refetchJobs } = useListJobRequests();
  const updateMembership = useUpdateWorkerMembership();
  const deleteWorker = useDeleteWorker();
  const updateJobStatus = useUpdateJobRequestStatus();

  const openJobCount = jobRequests?.filter(j => j.status === "open").length ?? 0;

  const handleMembershipChange = (id: number, type: any) => {
    updateMembership.mutate({ id, data: { membershipType: type } }, { onSuccess: () => refetchWorkers() });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this worker permanently?")) {
      deleteWorker.mutate({ id }, { onSuccess: () => refetchWorkers() });
    }
  };

  const handleJobStatus = (id: number, status: any) => {
    updateJobStatus.mutate({ id, data: { status } }, { onSuccess: () => refetchJobs() });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeWorkers || 0} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.premiumWorkers || 0) + (stats?.premiumPlusWorkers || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.premiumPlusWorkers || 0} Plus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.avgRating?.toFixed(1) || "0.0"} avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Requests</CardTitle>
            <Briefcase className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{openJobCount} open</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workers">
        <TabsList className="mb-6">
          <TabsTrigger value="workers">Workers ({workers?.length || 0})</TabsTrigger>
          <TabsTrigger value="jobs" className="relative">
            Job Requests
            {openJobCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-primary text-primary-foreground">
                {openJobCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Workers Tab */}
        <TabsContent value="workers">
          <Card>
            <CardHeader><CardTitle>Manage Workers</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers?.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-xs text-muted-foreground">{worker.phone}</div>
                        </TableCell>
                        <TableCell className="capitalize">{worker.category}</TableCell>
                        <TableCell>
                          {worker.isAvailable ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-500">Busy</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select defaultValue={worker.membershipType} onValueChange={(v) => handleMembershipChange(worker.id, v)}>
                            <SelectTrigger className="h-8 text-xs w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="premium_plus">Premium Plus</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(worker.createdAt), "MMM d, yy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(worker.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!workers?.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No workers found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Requests Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Customer Job Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobRequests?.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.customerName}</div>
                          <a href={`tel:${job.phone}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" />{job.phone}
                          </a>
                        </TableCell>
                        <TableCell className="capitalize">{job.category}</TableCell>
                        <TableCell className="text-sm">{job.area}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{job.budget || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[job.status]}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(job.createdAt), "MMM d, yy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select value={job.status} onValueChange={(v) => handleJobStatus(job.id, v)}>
                            <SelectTrigger className="h-8 text-xs w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!jobRequests?.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No job requests yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

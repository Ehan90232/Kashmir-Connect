import { useState } from "react";
import { useGetStatsSummary, useListWorkers, useUpdateWorkerMembership, useDeleteWorker } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { data: stats } = useGetStatsSummary();
  const { data: workers, refetch } = useListWorkers();
  const updateMembership = useUpdateWorkerMembership();
  const deleteWorker = useDeleteWorker();

  const handleMembershipChange = (id: number, type: any) => {
    updateMembership.mutate({ id, data: { membershipType: type } }, {
      onSuccess: () => refetch()
    });
  };

  const handleDelete = (id: number) => {
    if(confirm("Are you sure you want to delete this worker?")) {
      deleteWorker.mutate({ id }, {
        onSuccess: () => refetch()
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeWorkers || 0} currently available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Premium Members</CardTitle>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.premiumWorkers || 0) + (stats?.premiumPlusWorkers || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.avgRating?.toFixed(1) || "0.0"} average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Workers</CardTitle>
        </CardHeader>
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
                      <Select 
                        defaultValue={worker.membershipType} 
                        onValueChange={(v) => handleMembershipChange(worker.id, v)}
                      >
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No workers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

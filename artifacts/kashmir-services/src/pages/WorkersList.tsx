import { useState } from "react";
import { useLocation } from "wouter";
import { Filter, SlidersHorizontal, MapPin, Search } from "lucide-react";
import { useListWorkers, useListCategories } from "@workspace/api-client-react";
import { useLocation as useGeoLocation } from "@/hooks/use-location";
import { WorkerCard } from "@/components/worker/WorkerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function WorkersList() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const categoryParam = searchParams.get('category') || undefined;
  
  const { location: geoLoc, requestLocation, loading: geoLoading } = useGeoLocation();
  
  const [category, setCategory] = useState<string | undefined>(categoryParam);
  const [sort, setSort] = useState<"distance" | "rating" | "membership">("rating");
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: categories } = useListCategories();
  
  const { data: workers, isLoading } = useListWorkers({
    category,
    sort,
    available: availableOnly ? true : undefined,
    ...(sort === "distance" && geoLoc ? { lat: geoLoc.lat, lng: geoLoc.lng } : {})
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-card border rounded-xl p-5 sticky top-24">
            <h2 className="font-bold flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              Filters
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="membership">Premium First</SelectItem>
                    <SelectItem value="distance" disabled={!geoLoc}>
                      Distance {geoLoc ? "" : "(Needs Location)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!geoLoc && sort === "distance" && (
                  <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={requestLocation}>
                    {geoLoading ? "Locating..." : "Grant location access"}
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
                <Label htmlFor="available">Available Now</Label>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {workers ? `${workers.length} Workers Found` : "Find Workers"}
            </h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : workers && workers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {workers.map(worker => (
                <WorkerCard 
                  key={worker.id} 
                  worker={worker} 
                  showDistance={sort === "distance"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border rounded-xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No workers found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters or search in a different category.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setCategory(undefined); setAvailableOnly(false); setSort("rating"); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

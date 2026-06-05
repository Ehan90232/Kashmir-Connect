import { useState, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { useListWorkers, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
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
import { Badge } from "@/components/ui/badge";

export default function WorkersList() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const categoryParam = searchParams.get("category") || undefined;

  const { location: geoLoc, requestLocation, loading: geoLoading } = useGeoLocation();

  const [category, setCategory] = useState<string | undefined>(categoryParam);
  const [sort, setSort] = useState<"distance" | "rating" | "membership">("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const { data: workers, isLoading } = useListWorkers({
    category,
    sort,
    available: availableOnly ? true : undefined,
    ...(sort === "distance" && geoLoc ? { lat: geoLoc.lat, lng: geoLoc.lng } : {}),
  });

  const filtered = useMemo(() => {
    if (!workers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.profession.toLowerCase().includes(q) ||
        (w.area ?? "").toLowerCase().includes(q)
    );
  }, [workers, search]);

  const activeFilterCount = [category, availableOnly ? "available" : null].filter(Boolean).length;

  const clearAll = () => {
    setCategory(undefined);
    setAvailableOnly(false);
    setSort("rating");
    setSearch("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">

      {/* Search bar — full width at top */}
      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, profession, or area…"
          className="h-12 pl-11 pr-4 text-base rounded-xl bg-card border-border"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-card border rounded-xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 text-xs h-5 px-1.5">{activeFilterCount}</Badge>
                )}
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-primary hover:underline">
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sort} onValueChange={(v: "distance" | "rating" | "membership") => setSort(v)}>
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
                    {geoLoading ? "Locating…" : "Grant location access"}
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
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">
              {isLoading ? "Loading…" : (
                search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${filtered.length} Worker${filtered.length !== 1 ? "s" : ""} Found`
              )}
            </h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((worker) => (
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
                {search
                  ? `No results for "${search}". Try a different name or profession.`
                  : "Try adjusting your filters or search in a different category."}
              </p>
              <Button variant="outline" className="mt-6" onClick={clearAll}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { Search, MapPin, Navigation, ArrowRight, MapPinned, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/hooks/use-location";
import { useGetNearbyWorkers, useListCategories, getGetNearbyWorkersQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { WorkerCard } from "@/components/worker/WorkerCard";
import { Skeleton } from "@/components/ui/skeleton";

// Map of category slug to generic icon
const CategoryIconMap: Record<string, React.ReactNode> = {
  plumber: <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">P</div>,
  electrician: <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">E</div>,
  carpenter: <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">C</div>,
  painter: <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">P</div>,
  labourer: <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">L</div>,
  driver: <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">D</div>,
  tutor: <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">T</div>,
  default: <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">S</div>,
};

export default function Home() {
  const [, setLocationPath] = useWouterLocation();
  const { location, requestLocation, loading: locationLoading, error: locationError } = useLocation();
  
  const { data: categories, isLoading: categoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const nearbyParams = { lat: location?.lat || 0, lng: location?.lng || 0, limit: 6 };
  const { data: nearbyWorkers, isLoading: nearbyLoading } = useGetNearbyWorkers(
    nearbyParams,
    { query: { enabled: !!location, queryKey: getGetNearbyWorkersQueryKey(nearbyParams) } }
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 pt-12 pb-16 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-50">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] rounded-[100%] bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[150%] rounded-[100%] bg-secondary/10 blur-[100px]" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6">
            Find local help in <span className="text-primary">Kashmir</span>, instantly.
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            From plumbers and electricians to tutors and drivers. Connected directly. No middlemen.
          </p>
          
          <div className="bg-card p-2 rounded-2xl shadow-xl border max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="What service do you need?" 
                className="h-12 pl-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-base"
              />
            </div>
            <div className="h-px w-full sm:w-px sm:h-auto bg-border" />
            <div className="flex-1 relative flex items-center">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <div className="h-12 pl-10 flex items-center w-full bg-transparent text-sm text-muted-foreground pr-4 truncate">
                {location ? "Location acquired" : "Location needed"}
              </div>
            </div>
            <Button 
              className="h-12 px-8 rounded-xl w-full sm:w-auto"
              onClick={() => setLocationPath('/workers')}
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 flex-1">
        
        {/* Location Request Banner */}
        {!location && !locationLoading && (
          <div className="mb-12 bg-secondary/10 border border-secondary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between text-center md:text-left">
            <div>
              <h3 className="font-bold text-lg text-secondary-foreground mb-1">Find workers nearby</h3>
              <p className="text-secondary-foreground/80">Share your location to see the closest available professionals to your area.</p>
              {locationError && <p className="text-destructive text-sm mt-2">{locationError}</p>}
            </div>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white shrink-0 rounded-xl"
              onClick={requestLocation}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location
            </Button>
          </div>
        )}

        {/* Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <Link href="/workers" className="text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))
            ) : categories ? (
              categories.map((cat) => (
                <Link key={cat.id} href={`/workers?category=${cat.slug}`}>
                  <div className="bg-card border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover-elevate transition-all cursor-pointer group">
                    <div className="transform group-hover:scale-110 transition-transform">
                      {CategoryIconMap[cat.slug] || CategoryIconMap.default}
                    </div>
                    <span className="font-semibold text-card-foreground">{cat.name}</span>
                  </div>
                </Link>
              ))
            ) : null}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-10">How KashWork Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPinned className="w-7 h-7 text-primary" />,
                step: "1",
                title: "Share Your Location",
                desc: "Allow location access or enter your area to instantly see professionals near you.",
              },
              {
                icon: <Star className="w-7 h-7 text-amber-500" />,
                step: "2",
                title: "Pick the Best",
                desc: "Browse workers by category, read verified reviews, and choose based on ratings.",
              },
              {
                icon: <ShieldCheck className="w-7 h-7 text-green-600" />,
                step: "3",
                title: "Connect Directly",
                desc: "Call or WhatsApp the worker directly — no middlemen, no booking fees.",
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="bg-card border rounded-2xl p-6 text-center relative overflow-hidden group hover-elevate transition-all">
                <div className="absolute top-3 right-4 text-6xl font-black text-muted/20 select-none leading-none">{step}</div>
                <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Workers */}
        {location && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Nearby Workers
              </h2>
              <Link href={`/workers?lat=${location.lat}&lng=${location.lng}&sort=distance`} className="text-primary font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {nearbyLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : nearbyWorkers && nearbyWorkers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyWorkers.map(worker => (
                  <WorkerCard key={worker.id} worker={worker} showDistance />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed">
                <p className="text-muted-foreground">No workers found nearby. Try expanding your search area.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

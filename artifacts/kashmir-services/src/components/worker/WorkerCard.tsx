import { Link } from "wouter";
import { Star, Phone, MessageCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MembershipBadge } from "./MembershipBadge";
import type { Worker, WorkerWithDistance } from "@workspace/api-client-react";

interface WorkerCardProps {
  worker: Worker | WorkerWithDistance;
  showDistance?: boolean;
}

export function WorkerCard({ worker, showDistance = false }: WorkerCardProps) {
  const isAvailable = worker.isAvailable;
  
  return (
    <Card className="overflow-hidden hover-elevate transition-all border-card-border bg-card">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/10">
            <AvatarImage src={worker.photoUrl || ""} alt={worker.name} />
            <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
              {worker.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/workers/${worker.id}`} className="hover:underline focus:outline-none focus:underline min-w-0">
                <h3 className="font-semibold text-lg text-card-foreground leading-snug flex items-center gap-1.5 flex-wrap">
                  <span>{worker.name}</span>
                  <MembershipBadge type={worker.membershipType} />
                </h3>
              </Link>
              {isAvailable ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0 mt-0.5">Available</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 shrink-0 mt-0.5">Busy</Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm font-medium">{worker.profession}</p>
            
            <div className="flex items-center gap-3 mt-1.5 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {worker.averageRating.toFixed(1)} <span className="text-muted-foreground font-normal">({worker.totalRatings})</span>
              </div>
              
              {(showDistance && 'distanceKm' in worker) || worker.area ? (
                <div className="flex items-center gap-1 text-muted-foreground truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {showDistance && 'distanceKm' in worker 
                      ? `${(worker as WorkerWithDistance).distanceKm.toFixed(1)} km away` 
                      : worker.area || "Kashmir"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-px bg-muted/50 border-t">
        <a 
          href={`tel:${worker.phone}`} 
          className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-muted/30 transition-colors text-primary font-medium"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a 
          href={`https://wa.me/91${worker.phone}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-muted/30 transition-colors text-[#25D366] font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </Card>
  );
}

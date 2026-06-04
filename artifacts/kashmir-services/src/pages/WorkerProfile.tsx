import { useParams, Link } from "wouter";
import { Star, Phone, MessageCircle, MapPin, Calendar, Info, Award, UserCircle } from "lucide-react";
import { useGetWorker, useListWorkerReviews, getGetWorkerQueryKey, getListWorkerReviewsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MembershipBadge } from "@/components/worker/MembershipBadge";
import { format } from "date-fns";

export default function WorkerProfile() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: worker, isLoading: workerLoading } = useGetWorker(id, {
    query: { enabled: !!id, queryKey: getGetWorkerQueryKey(id) }
  });

  const { data: reviews, isLoading: reviewsLoading } = useListWorkerReviews(id, {
    query: { enabled: !!id, queryKey: getListWorkerReviewsQueryKey(id) }
  });

  if (workerLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Worker not found</h1>
        <p className="mt-2 text-muted-foreground">The profile you are looking for does not exist.</p>
        <Link href="/workers" className="mt-6 inline-block text-primary hover:underline">
          Back to workers list
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-full">
      {/* Header Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/80 to-secondary/80 w-full" />
      
      <div className="container mx-auto px-4 max-w-4xl pb-16">
        <div className="bg-card rounded-2xl shadow-sm border -mt-16 relative z-10 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <Avatar className="w-32 h-32 border-4 border-card bg-card shadow-sm -mt-16 md:-mt-20">
              <AvatarImage src={worker.photoUrl || ""} alt={worker.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                {worker.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
                    {worker.name}
                    <MembershipBadge type={worker.membershipType} className="scale-125" />
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">{worker.profession}</p>
                </div>
                
                <div className="flex gap-2 justify-center shrink-0">
                  {worker.isAvailable ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3 py-1">Available Now</Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 border-none">Currently Busy</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-foreground">{worker.averageRating.toFixed(1)}</span>
                  <span>({worker.totalRatings} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{worker.area || "Kashmir"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(worker.createdAt), "MMM yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button size="lg" className="w-full text-lg rounded-xl h-14" asChild>
              <a href={`tel:${worker.phone}`}>
                <Phone className="w-5 h-5 mr-2" />
                Call {worker.phone}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full text-lg rounded-xl h-14 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10" asChild>
              <a href={`https://wa.me/91${worker.phone}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Message
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <UserCircle className="w-5 h-5 text-primary" />
                About {worker.name.split(' ')[0]}
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                {worker.bio ? (
                  <p className="whitespace-pre-wrap">{worker.bio}</p>
                ) : (
                  <p className="italic">No biography provided.</p>
                )}
              </div>
            </section>

            <section className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Reviews ({worker.totalRatings})
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/rate/${worker.id}`}>Write a Review</Link>
                </Button>
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-foreground">{review.reviewerName}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
                  No reviews yet. Be the first to rate {worker.name.split(' ')[0]}!
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Service Details
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{worker.category}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Verification</span>
                  <span className="font-medium flex items-center gap-1">
                    {worker.membershipType !== 'free' ? (
                      <span className="text-blue-600 flex items-center gap-1"><Award className="w-3 h-3" /> Verified</span>
                    ) : (
                      "Basic Profile"
                    )}
                  </span>
                </li>
              </ul>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm">
              <h4 className="font-bold text-primary mb-2">Safety Tip</h4>
              <p className="text-muted-foreground">
                Always agree on the scope of work and pricing before the job starts. KashWork provides the connection, but payment happens directly between you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

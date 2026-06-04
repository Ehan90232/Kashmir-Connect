import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGetWorker, useCreateReview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Star, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  reviewerName: z.string().min(2, "Name required."),
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z.string().optional(),
});

export default function RateWorker() {
  const params = useParams();
  const workerId = params.workerId ? parseInt(params.workerId) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: worker, isLoading: workerLoading } = useGetWorker(workerId, {
    query: { enabled: !!workerId }
  });
  
  const createReview = useCreateReview();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewerName: "",
      rating: 0,
      comment: "",
    },
  });

  const watchRating = form.watch("rating");

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReview.mutate({
      workerId,
      data: values
    }, {
      onSuccess: () => {
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback.",
        });
        navigate(`/workers/${workerId}`);
      },
      onError: () => {
        toast({
          title: "Submission failed",
          description: "There was an error submitting your review. Please try again.",
          variant: "destructive"
        });
      }
    });
  }

  if (workerLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!worker) return <div className="p-12 text-center">Worker not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Link href={`/workers/${workerId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Link>
      
      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Rate {worker.name}</h1>
        <p className="text-muted-foreground mb-8">Share your experience to help others in the community.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Tap to Rate</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="p-1 focus:outline-none focus-visible:ring-2 rounded-full transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star 
                            className={`w-10 h-10 ${
                              star <= watchRating 
                                ? "fill-amber-500 text-amber-500" 
                                : "text-muted-foreground/30 hover:text-amber-500/50"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reviewerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How was the service?" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-lg" disabled={createReview.isPending || watchRating === 0}>
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

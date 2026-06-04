import { useState } from "react";
import { Link, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGetWorker, useCreateReview, getGetWorkerQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Star, ArrowLeft, MessageCircle, CheckCircle2, ExternalLink } from "lucide-react";

const formSchema = z.object({
  reviewerName: z.string().min(2, "Name required."),
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z.string().optional(),
});

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function buildWhatsAppUrl(phone: string, workerName: string, rating: number, reviewerName: string, comment?: string): string {
  const stars = "⭐".repeat(rating);
  const lines = [
    `Salaam ${workerName}!`,
    ``,
    `${stars} You received a *${rating}-star review* on *KashWork* from ${reviewerName}.`,
  ];
  if (comment) {
    lines.push(``, `"${comment}"`);
  }
  lines.push(``, `Keep up the great work!`);
  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/91${phone}?text=${message}`;
}

export default function RateWorker() {
  const params = useParams();
  const workerId = params.workerId ? parseInt(params.workerId) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: worker, isLoading: workerLoading } = useGetWorker(workerId, {
    query: { enabled: !!workerId, queryKey: getGetWorkerQueryKey(workerId) }
  });

  const createReview = useCreateReview();
  const [submitted, setSubmitted] = useState<{ rating: number; reviewerName: string; comment?: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { reviewerName: "", rating: 0, comment: "" },
  });

  const watchRating = form.watch("rating");

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReview.mutate({ workerId, data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkerQueryKey(workerId) });
        setSubmitted({ rating: values.rating, reviewerName: values.reviewerName, comment: values.comment });
      },
      onError: () => {
        toast({ title: "Submission failed", description: "There was an error submitting your review. Please try again.", variant: "destructive" });
      }
    });
  }

  if (workerLoading) return <div className="p-12 text-center text-muted-foreground">Loading...</div>;
  if (!worker) return <div className="p-12 text-center text-muted-foreground">Worker not found</div>;

  if (submitted) {
    const waUrl = buildWhatsAppUrl(worker.phone, worker.name, submitted.rating, submitted.reviewerName, submitted.comment);
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-6">

          {/* Success icon */}
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Review Submitted!</h1>
            <p className="text-muted-foreground mt-2">
              Thank you for rating <span className="font-semibold text-foreground">{worker.name}</span>.
              Your feedback helps the community.
            </p>
          </div>

          {/* Stars recap */}
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-7 h-7 ${s <= submitted.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20"}`} />
            ))}
            <span className="ml-2 font-semibold text-lg">{STAR_LABELS[submitted.rating]}</span>
          </div>

          {/* WhatsApp notify button */}
          <div className="bg-[#e7f9ef] border border-[#25D366]/30 rounded-xl p-5 space-y-3">
            <p className="font-semibold text-[#128C3E]">Let {worker.name} know!</p>
            <p className="text-sm text-[#128C3E]/80">
              Workers don't always see reviews right away. Send them a WhatsApp notification so they know immediately.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-whatsapp-notify"
            >
              <Button className="w-full h-12 text-base bg-[#25D366] hover:bg-[#1da851] text-white border-0 gap-2">
                <MessageCircle className="w-5 h-5" />
                Notify {worker.name.split(" ")[0]} on WhatsApp
                <ExternalLink className="w-4 h-4 opacity-70" />
              </Button>
            </a>
          </div>

          <Link href={`/workers/${workerId}`}>
            <Button variant="ghost" className="w-full text-muted-foreground">
              Skip — go to profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Link href={`/workers/${workerId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Link>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Rate {worker.name}</h1>
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
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            data-testid={`star-${star}`}
                            onClick={() => field.onChange(star)}
                            className="p-1 focus:outline-none focus-visible:ring-2 rounded-full transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                star <= watchRating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30 hover:text-amber-500/50"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {watchRating > 0 && (
                        <p className="text-sm font-medium text-amber-600">{STAR_LABELS[watchRating]}</p>
                      )}
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
                    <Input data-testid="input-reviewer-name" placeholder="Enter your name" {...field} />
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
                      data-testid="textarea-comment"
                      placeholder="How was the service?"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              data-testid="button-submit-review"
              className="w-full h-12 text-lg"
              disabled={createReview.isPending || watchRating === 0}
            >
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

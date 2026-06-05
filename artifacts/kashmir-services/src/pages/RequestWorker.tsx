import { useState } from "react";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListCategories, useCreateJobRequest, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useLocation } from "@/hooks/use-location";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MapPin, Navigation, ArrowLeft, Briefcase } from "lucide-react";

const BUDGET_OPTIONS = [
  "Under ₹500",
  "₹500 – ₹1,000",
  "₹1,000 – ₹2,500",
  "₹2,500 – ₹5,000",
  "₹5,000+",
  "Negotiable",
];

const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Enter a valid 10-digit phone number."),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Describe the job in at least 10 characters."),
  area: z.string().min(2, "Enter your area or locality."),
  budget: z.string().optional(),
});

export default function RequestWorker() {
  const { toast } = useToast();
  const { location, requestLocation, loading: geoLoading } = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const createJobRequest = useCreateJobRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { customerName: "", phone: "", category: "", description: "", area: "", budget: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createJobRequest.mutate({
      data: {
        ...values,
        budget: values.budget || undefined,
        latitude: location?.lat,
        longitude: location?.lng,
      }
    }, {
      onSuccess: () => setSubmitted(true),
      onError: () => toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" }),
    });
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Request Posted!</h1>
            <p className="text-muted-foreground mt-2">
              Your job request is now live. Available workers in your area can see it and contact you directly.
            </p>
          </div>
          <div className="bg-muted/40 rounded-xl p-4 text-sm text-left space-y-1">
            <p><span className="font-medium">Category:</span> {form.getValues("category")}</p>
            <p><span className="font-medium">Area:</span> {form.getValues("area")}</p>
            <p className="text-muted-foreground">Workers will call you on <span className="font-medium text-foreground">{form.getValues("phone")}</span></p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/workers">
              <Button className="w-full">Browse Workers Instead</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-muted-foreground">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Link>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Post a Job Request</h1>
            <p className="text-muted-foreground text-sm">Workers near you will see this and call you directly.</p>
          </div>
        </div>

        {/* Location banner */}
        {!location ? (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Add your location for better worker matches</span>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 border-blue-300 text-blue-700" onClick={requestLocation} disabled={geoLoading}>
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              {geoLoading ? "Locating…" : "Allow"}
            </Button>
          </div>
        ) : (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
            <MapPin className="w-4 h-4 shrink-0" />
            Location captured — workers near you will be prioritised.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="10-digit number" type="tel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Service Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="What kind of help do you need?" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="area" render={({ field }) => (
              <FormItem>
                <FormLabel>Your Area / Locality</FormLabel>
                <FormControl><Input placeholder="e.g. Anantnag, Bijbehara, Kokernag…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Describe the Job</FormLabel>
                <FormControl>
                  <Textarea placeholder="What exactly needs to be done? Any specific requirements…" className="min-h-[110px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="budget" render={({ field }) => (
              <FormItem>
                <FormLabel>Budget <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a budget range" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BUDGET_OPTIONS.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full h-12 text-base" disabled={createJobRequest.isPending}>
              {createJobRequest.isPending ? "Posting…" : "Post Job Request"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

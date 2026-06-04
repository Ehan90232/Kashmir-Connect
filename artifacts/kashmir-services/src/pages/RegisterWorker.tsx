import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateWorker, useListCategories } from "@workspace/api-client-react";
import { useLocation as useGeoLocation } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// FormLabel is used inside FormField render props below
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Briefcase } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Valid phone number required.").max(15),
  profession: z.string().min(2, "Profession is required."),
  category: z.string().min(1, "Please select a category."),
  area: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export default function RegisterWorker() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { location: geoLoc, requestLocation, loading: geoLoading } = useGeoLocation();
  const { data: categories } = useListCategories();
  
  const createWorker = useCreateWorker();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      profession: "",
      category: "",
      area: "",
      bio: "",
      photoUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!geoLoc) {
      toast({
        title: "Location Required",
        description: "Please share your location so customers can find you nearby.",
        variant: "destructive"
      });
      return;
    }

    createWorker.mutate({
      data: {
        ...values,
        latitude: geoLoc.lat,
        longitude: geoLoc.lng,
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Registration successful!",
          description: "Your profile has been created.",
        });
        navigate(`/workers/${data.id}`);
      },
      onError: () => {
        toast({
          title: "Registration failed",
          description: "There was an error creating your profile. Please try again.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">Join KashWork</h1>
        <p className="text-muted-foreground mt-2">Create your profile to start receiving job requests in your area.</p>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormDescription>Customers will contact you here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Profession/Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Master Carpenter, Math Tutor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-base font-medium">
                    <MapPin className="w-4 h-4 text-primary" /> Location
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {geoLoc 
                      ? "Location acquired successfully. Customers can find you!" 
                      : "We need your location to show you to nearby customers."}
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant={geoLoc ? "outline" : "default"} 
                  onClick={requestLocation}
                  disabled={geoLoading || !!geoLoc}
                >
                  {geoLoc ? "Location Set" : geoLoading ? "Locating..." : "Get Location"}
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area / Locality Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lal Chowk, Srinagar" {...field} />
                  </FormControl>
                  <FormDescription>A readable name for your primary service area.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell customers about your experience, skills, and what makes you reliable..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/photo.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={createWorker.isPending}>
              {createWorker.isPending ? "Registering..." : "Create Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

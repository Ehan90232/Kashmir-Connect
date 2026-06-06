import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SearchX,
  Clock,
  MapPinOff,
  EyeOff,
  MapPin,
  Star,
  Smartphone,
  Zap,
  UserPlus,
  TrendingUp,
  BadgeCheck,
  Crown,
  ArrowRight,
  Globe,
} from "lucide-react";

const problems = [
  {
    icon: SearchX,
    title: "Hard to Find Trusted Workers",
    description: "You rely on word-of-mouth and hope someone in your contacts knows a good plumber or electrician.",
  },
  {
    icon: Clock,
    title: "Time Wasted Asking Around",
    description: "Calling relatives, sending WhatsApp messages, and waiting for replies just to find one worker.",
  },
  {
    icon: MapPinOff,
    title: "No Central Place for Local Services",
    description: "There's no single platform where all local workers in Kashmir are discoverable.",
  },
  {
    icon: EyeOff,
    title: "Workers Have Limited Visibility",
    description: "Skilled workers in your area don't have a way to reach customers beyond their immediate network.",
  },
];

const solutions = [
  { icon: MapPin, title: "Find Nearby Workers", description: "Discover workers within your area instantly, sorted by distance." },
  { icon: Zap, title: "Location-Based Discovery", description: "Allow location and instantly see who's available closest to you." },
  { icon: UserPlus, title: "Easy Worker Registration", description: "Workers sign up in minutes with their profile, skills, and location." },
  { icon: Star, title: "Ratings & Trust", description: "Every worker has verified customer reviews so you know who to trust." },
  { icon: Smartphone, title: "Simple Mobile Experience", description: "Works perfectly on any phone — no app download needed." },
  { icon: BadgeCheck, title: "Faster Hiring", description: "Go from need to contact in under a minute." },
];

const steps = [
  { number: "01", title: "Open Website", description: "Visit KashWork on any device, no account needed to browse." },
  { number: "02", title: "Allow Location", description: "Share your location so we can show workers near you." },
  { number: "03", title: "Select Service", description: "Pick the type of work you need — plumber, electrician, driver, and more." },
  { number: "04", title: "Connect with Worker", description: "Call or WhatsApp directly. No middleman, no fees." },
];

const workerBenefits = [
  { icon: TrendingUp, title: "More Visibility", description: "Your profile is discoverable by everyone searching in your area." },
  { icon: Globe, title: "More Customers", description: "Reach customers you'd never find through word-of-mouth alone." },
  { icon: UserPlus, title: "Easy Sign Up", description: "Create your profile in under 3 minutes. Free to join." },
  { icon: Crown, title: "Premium Options", description: "Go Premium to appear at the top of results and get a verified badge." },
];

export default function WhyKashWork() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Built for Kashmir
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Why{" "}
            <span className="text-primary">KashWork?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            KashWork was created to make finding local workers in Kashmir simple, fast, and accessible — for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
            In Kashmir, finding a reliable plumber, electrician, driver, or tutor has always been an informal process — calling relatives, asking neighbors, sending messages in family groups.
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            We built KashWork to change that. Our mission is to connect customers with skilled local workers instantly, removing the friction and making local services as easy as a web search.
          </p>
        </div>
      </section>

      {/* Problems */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">The Problem We Solve</h2>
            <p className="text-muted-foreground">Sound familiar? These are the everyday struggles KashWork fixes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {problems.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-destructive/20 bg-destructive/5 hover:border-destructive/40 transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How KashWork Fixes It</h2>
            <p className="text-muted-foreground">Everything we built is designed around making this simpler for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {solutions.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-primary/20 hover:border-primary/50 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How KashWork Works</h2>
            <p className="text-muted-foreground">Four simple steps to get help today.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-extrabold mb-4 shadow-md">
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-5 -right-4 w-5 h-5 text-primary/40" />
                )}
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Workers */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">For Workers</h2>
            <p className="text-muted-foreground">KashWork isn't just for customers — it helps workers grow their business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {workerBenefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="text-center border-primary/20 hover:border-primary/50 hover:shadow-md transition-all">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            We're starting locally — in Anantnag — and growing across Kashmir. Our goal is to become the go-to platform for local services in every district, making quality work accessible to every family and opportunity reachable for every skilled worker.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Join KashWork and make local services easier.
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-base md:text-lg">
            Whether you need help at home or you're a skilled professional — KashWork is for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/workers">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 font-semibold">
                Find Workers <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 font-semibold bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Register as Worker <UserPlus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

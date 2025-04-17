
import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16 md:pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient z-0"></div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/80 backdrop-blur-sm text-xs font-medium mb-6 animate-fade-in">
            Premium venues for extraordinary events
          </div>
          
          <h1 className="animate-slide-down mb-6 text-balance">
            Elevate Your Events with Exceptional Venues
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto animate-slide-up delay-100 text-balance">
            Discover and book the perfect restaurant for your corporate events, weddings, and special celebrations.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-200">
            <Button size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              Find Venues
            </Button>
            <Button size="lg" variant="outline">
              How It Works
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"></div>
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
    </section>
  );
};

export default Hero;

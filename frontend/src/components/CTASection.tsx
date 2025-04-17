
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
      
      <div className="container px-4 mx-auto relative">
        <div className="max-w-3xl mx-auto text-center glass-morphism p-8 md:p-12 rounded-2xl">
          <h2 className="mb-6">Ready to Host Your Next Event?</h2>
          <p className="text-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Discover the perfect venue and make your event extraordinary. Our premium restaurants and event spaces are waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/restaurants">Browse Venues</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;


import React from "react";
import { Search, Calendar, ThumbsUp } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Find Your Ideal Venue",
    description: "Search through our curated selection of premium restaurants and venues for large events.",
    icon: Search,
  },
  {
    id: 2,
    title: "Book Your Date",
    description: "Select your date, specify your event requirements, and request a reservation.",
    icon: Calendar,
  },
  {
    id: 3,
    title: "Receive Confirmation",
    description: "Get quick confirmation from the venue and finalize all the details for your perfect event.",
    icon: ThumbsUp,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-foreground/70 text-lg">
            Our simple booking process makes planning large events effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-background rounded-lg p-6 shadow-sm border flex flex-col items-center text-center group hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

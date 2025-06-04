
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "The venue booking process was seamless. We hosted our company anniversary at Elevation Grand Hall, and everything was perfect.",
    author: "Zhana Malikova",
    position: "Event Director, Techwave",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "Toila.kz helped us find the perfect restaurant for our charity gala. The service was exceptional from start to finish.",
    author: "Dias Nurmukhametov",
    position: "Foundation President",
    image: "public/images/image_dias.png"
  },
  {
    id: 3,
    quote: "Planning our annual conference dinner was stress-free thanks to Toila.kz. Highly recommended for corporate events.",
    author: "Amina Sarsenova",
    position: "Operations Manager, GlobalTech",
    image: "public/images/image_amina.png"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="mb-4">What Our Clients Say</h2>
          <p className="text-foreground/70 text-lg">
            Hear from event planners who have used our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <Quote className="h-10 w-10 text-primary/20 mb-4" />
                <p className="text-foreground/80 mb-6 flex-grow">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-foreground/60">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

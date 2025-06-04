
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero section */}
        <section className="py-12 md:py-20 bg-secondary/40 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="mb-6">About Toila.kz</h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-0 max-w-2xl mx-auto">
                Connecting exceptional venues with extraordinary events
              </p>
            </div>
          </div>
        </section>
        
        {/* Our story */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop"
                    alt="Our team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-foreground/80 mb-4 text-lg">
                  Our restaurant booking platform was launched with a clear goal: simplify and modernize the way people reserve restaurants for major events like weddings, corporate gatherings, and private celebrations.
                </p>
                <p className="text-foreground/80 mb-6 text-lg">
                  We realized that organizing large events often meant dealing with outdated systems, long phone calls, and uncertainty about availability. Our solution brings everything into one place — users can easily browse, filter, and book top venues that match their requirements, saving valuable time and effort.
                </p>
                <p className="text-foreground/80 text-lg">
                  Today, our platform connects clients with trusted restaurants in key cities, ensuring smooth planning, verified availability, and a hassle-free booking experience. We’re committed to making every event special through smart technology and seamless service.
                </p>
            </div>

            </div>
          </div>
        </section>
        
        {/* Values */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="mb-4">Our Values</h2>
              <p className="text-foreground/70 text-lg">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Excellence",
                  description: "We curate only the finest venues that meet our strict standards for quality, service, and ambiance."
                },
                {
                  title: "Simplicity",
                  description: "We believe that booking a venue should be straightforward and stress-free, even for complex events."
                },
                {
                  title: "Transparency",
                  description: "We provide clear, detailed information about each venue, including honest reviews from past clients."
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="bg-background rounded-lg p-8 shadow-sm border text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full mx-auto mb-6 text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-foreground/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="mb-4">Meet Our Team</h2>
              <p className="text-foreground/70 text-lg">
                The passionate people behind Toila.kz
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Yessenbek Abyur",
                  position: "Founder & CEO",
                  image: "public/images/image_yessen.png"
                },
                {
                  name: "Aliar Azimsham",
                  position: "Senior Cybersecurity Engineer",
                  image: "public/images/image_ali.png"
                },
                
                {
                  name: "Aigerim Aitpaeva",
                  position: "Cheif Product Officer",
                  image: "public/images/image_gera.png"
                },
                {
                  name: "Diana Nurmukhametova",
                  position: "Event Success Manager",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1922&auto=format&fit=crop"
                }
              ].map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="aspect-square rounded-full overflow-hidden mb-4 mx-auto max-w-[220px]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-foreground/70">{member.position}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-6">Join Our Network</h2>
              <p className="text-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Are you a restaurant or venue owner? Partner with Toila.kz to reach event planners looking for exceptional spaces.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/contact">Become a Partner</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

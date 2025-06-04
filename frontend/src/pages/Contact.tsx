
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon.",
    });
    form.reset();
  }

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
              <h1 className="mb-6">Contact Us</h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-0 max-w-2xl mx-auto">
                We're here to help with any questions about our venue booking services
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact details and form */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Contact information */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>
                      Our team is ready to assist you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 mt-0.5 text-foreground/70" />
                      <div>
                        <h3 className="font-medium mb-1">Visit Our Office</h3>
                        <p className="text-foreground/70">
                          Astana city, mangilik el street, 10/1<br />
                          Almaty city, Al-Farabi street, 20/1
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-3 mt-0.5 text-foreground/70" />
                      <div>
                        <h3 className="font-medium mb-1">Email Us</h3>
                        <a 
                          href="mailto:contact@tableelite.com" 
                          className="text-foreground/70 hover:text-foreground transition-colors"
                        >
                          esenbekabyur@gmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 mt-0.5 text-foreground/70" />
                      <div>
                        <h3 className="font-medium mb-1">Call Us</h3>
                        <a 
                          href="tel:+12123456789" 
                          className="text-foreground/70 hover:text-foreground transition-colors"
                        >
                          87478014087
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 mt-0.5 text-foreground/70" />
                      <div>
                        <h3 className="font-medium mb-1">Business Hours</h3>
                        <p className="text-foreground/70">
                          Monday - Friday: 9AM - 6PM<br />
                          Weekend: 10AM - 4PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Contact form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="booking">Venue Booking</SelectItem>
                                  <SelectItem value="support">Customer Support</SelectItem>
                                  <SelectItem value="partnership">Venue Partnership</SelectItem>
                                  <SelectItem value="careers">Careers</SelectItem>
                                  <SelectItem value="feedback">Feedback</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Type your message here..."
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full md:w-auto md:min-w-[200px]">
                          Send Message
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map section */}
        <section className="py-16 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="mb-4">Our Location</h2>
              <p className="text-foreground/70 text-lg">
                Come visit our office in the heart of the city
              </p>
            </div>
            
            <div className="aspect-[21/9] bg-background rounded-xl overflow-hidden">
              {/* Map would go here */}
              <div className="w-full h-full flex items-center justify-center text-foreground/50">
                Interactive Map Would Be Displayed Here
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="mb-4">Frequently Asked Questions</h2>
              <p className="text-foreground/70 text-lg">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  question: "How does the booking process work?",
                  answer: "Once you submit a booking request through our platform, the venue will review your requirements and respond with availability and pricing. You can then confirm the booking directly with the venue."
                },
                {
                  question: "Is there a fee to use Toila.kz?",
                  answer: "No, our platform is free to use for event planners. We work with venues on a partnership basis, so you never pay extra to book through us."
                },
                {
                  question: "How far in advance should I book?",
                  answer: "For large events, we recommend booking at least 3-6 months in advance, especially for popular venues and dates. Some venues may be booked up to a year in advance for peak seasons."
                },
                {
                  question: "Can I visit venues before booking?",
                  answer: "Yes, we encourage site visits. After your initial inquiry, we can arrange a tour with the venue management to see the space in person."
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

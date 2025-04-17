
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewService } from "@/services/reviewService";

const reviewSchema = z.object({
  author: z.string().min(2, { message: "Name must be at least 2 characters." }),
  comment: z.string().min(10, { message: "Review must be at least 10 characters." }),
});

type ReviewFormProps = {
  restaurantId: string;
  onReviewSubmitted: () => void;
};

const ReviewForm = ({ restaurantId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: "",
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof reviewSchema>) {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        author: values.author,
        rating: rating,
        comment: values.comment
      };

      const response = await reviewService.createReview(restaurantId, reviewData);
      
      if (response) {
        toast({
          title: "Review Submitted",
          description: "Thank you for sharing your experience!",
        });
        
        form.reset();
        setRating(0);
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      <div className="flex items-center mb-4">
        <div className="mr-2">Your rating:</div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 cursor-pointer transition-colors ${
                (hoverRating || rating) >= star
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
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
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your experience with this venue..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;

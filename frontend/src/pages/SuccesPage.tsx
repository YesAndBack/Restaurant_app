import React, { useEffect, useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

const SuccessPage = () => {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const requestSentRef = useRef(false);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      // Prevent duplicate requests
      if (requestSentRef.current) {
        console.log('Restaurant creation request already sent, preventing duplicate');
        return;
      }
      
      try {
        // Mark that we're starting the request
        requestSentRef.current = true;
        
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Check if this session has already been processed
        const processedSessions = localStorage.getItem('processed_payment_sessions');
        const processedSessionsArray = processedSessions ? JSON.parse(processedSessions) : [];
        
        if (processedSessionsArray.includes(sessionId)) {
          console.log('Session already processed, skipping restaurant creation');
          setSuccess(true);
          setProcessing(false);
          return;
        }

        // Get features and cuisines from localStorage
        let features = [];
        let cuisines = [];
        let storedFormData = {};
        
        try {
          // First try to get from localStorage
          const storedFeatures = localStorage.getItem('restaurant_features');
          const storedCuisines = localStorage.getItem('restaurant_cuisines');
          const storedData = localStorage.getItem('restaurant_form_data');
          
          if (storedFeatures) {
            features = JSON.parse(storedFeatures);
          }
          
          if (storedCuisines) {
            cuisines = JSON.parse(storedCuisines);
          }
          
          if (storedData) {
            storedFormData = JSON.parse(storedData);
          }
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
        
        // If localStorage doesn't have the data, try URL params (fallback)
        if (features.length === 0) {
          try {
            const featuresParam = urlParams.get('features');
            if (featuresParam) {
              features = JSON.parse(featuresParam);
            }
          } catch (err) {
            console.error('Error parsing features from URL:', err);
          }
        }
        
        if (cuisines.length === 0) {
          try {
            const cuisinesParam = urlParams.get('cuisines');
            if (cuisinesParam) {
              cuisines = JSON.parse(cuisinesParam);
            }
          } catch (err) {
            console.error('Error parsing cuisines from URL:', err);
          }
        }

        // Get form data from either localStorage or URL params
        const restaurantData = {
          session_id: sessionId,
          name: storedFormData.name || urlParams.get('name') || '',
          description: storedFormData.description || urlParams.get('description') || '',
          location: storedFormData.location || urlParams.get('location') || '',
          category: storedFormData.category || urlParams.get('category') || '',
          capacity: storedFormData.capacity || parseInt(urlParams.get('capacity') || '0'),
          contact_phone: storedFormData.contact_phone || urlParams.get('contact_phone') || '',
          contact_email: storedFormData.contact_email || urlParams.get('contact_email') || '',
          average_price: storedFormData.average_price || parseInt(urlParams.get('average_price') || '0'),
          image_urls: storedFormData.image_urls || urlParams.get('image_urls') || '',
          opening_hours: storedFormData.opening_hours || urlParams.get('opening_hours') || '',
          user_id: parseInt(urlParams.get('user_id') || '0'),
          features: features,
          cuisines: cuisines,
        };

        console.log('Restaurant data to send:', restaurantData);

        const token = localStorage.getItem('booking_access_token');
        const response = await fetch('http://localhost:8001/rest/restaurants/create-after-payment/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(restaurantData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Failed to create restaurant');
        }

        // Add this session ID to processed sessions
        processedSessionsArray.push(sessionId);
        localStorage.setItem('processed_payment_sessions', JSON.stringify(processedSessionsArray));

        // Clear restaurant form data after successful restaurant creation
        localStorage.removeItem('restaurant_features');
        localStorage.removeItem('restaurant_cuisines');
        localStorage.removeItem('restaurant_form_data');

        setSuccess(true);
        toast({
          title: "Restaurant Created Successfully!",
          description: "Your payment was processed and restaurant has been created.",
        });

      } catch (error) {
        console.error('Error processing payment success:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to process payment",
          variant: "destructive",
        });
        // Reset the request flag on error so user can try again
        requestSentRef.current = false;
      } finally {
        setProcessing(false);
      }
    };

    processPaymentSuccess();

    // Cleanup function
    return () => {
      // Keep requestSentRef value even if component unmounts
    };
  }, []);

  const handleGoToDashboard = () => {
    window.location.href = '/admin-dashboard';
  };

  const handleViewRestaurants = () => {
    window.location.href = '/restaurants';
  };

  const handleTryAgain = () => {
    window.location.href = '/restaurant-add';
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Processing your payment...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we create your restaurant.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {success ? 'Payment Successful!' : 'Payment Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <>
              <p className="text-center text-muted-foreground">
                Your restaurant has been successfully created and is now live on our platform.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleViewRestaurants}
                  variant="outline" 
                  className="w-full"
                >
                  View All Restaurants
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleTryAgain}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={handleGoToDashboard}
                  variant="outline" 
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;
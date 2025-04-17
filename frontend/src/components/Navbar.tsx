import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage or cookies
        const token = localStorage.getItem("booking_access_token");
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Fetch user data from the API
        const response = await fetch("http://localhost:8001/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If the request fails, clear the token
          localStorage.removeItem("booking_access_token");
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8001/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("booking_access_token")}`
        }
      });
      
      if (response.ok) {
        // Clear token from localStorage
        localStorage.removeItem("booking_access_token");
        setUser(null);
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight transition-opacity hover:opacity-80">
            Toila.kz
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/restaurants" className="text-foreground/80 hover:text-foreground transition-colors">
                Restaurants
              </Link>
              <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Button 
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full"
                  variant="outline"
                  >
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{user.phone}</span>
             
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className="py-2 text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/restaurants" className="py-2 text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Restaurants
            </Link>
            <Link to="/about" className="py-2 text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="py-2 text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </Link>
            
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {loading ? (
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded-md"></div>
              ) : user ? (
                <>
                  <Button 
                    className="flex items-center space-x-2 py-2" 
                    onClick={() => navigate("/profile")}
                    variant="outline"
                  >
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{user.phone}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-center flex items-center space-x-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="justify-center" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button size="sm" className="justify-center" onClick={() => navigate("/register")}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
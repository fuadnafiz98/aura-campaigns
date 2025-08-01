import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Users, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if user has auth tokens in localStorage
    const checkAuth = () => {
      const keys = Object.keys(localStorage);
      const hasAuthToken = keys.some(
        (key) =>
          key.includes("__convexAuthJWT_") ||
          key.includes("__convexAuthRefreshToken_"),
      );
      setHasToken(hasAuthToken);
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-primary">Aura Campaigns</div>
          <div className="flex gap-2">
            {hasToken ? (
              <Link to="/app">
                <Button>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Email Campaigns
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, manage, and track your email campaigns with powerful
            automation. Reach your audience effectively with our intuitive
            platform.
          </p>

          {hasToken ? (
            <Link to="/app">
              <Button size="lg" className="text-lg px-8 py-6">
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your First Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Campaigns</h3>
            <p className="text-muted-foreground">
              Create beautiful email sequences with our drag-and-drop editor
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Audience Management</h3>
            <p className="text-muted-foreground">
              Segment and target your audience with precision
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">
              Track performance with detailed analytics and insights
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Aura Campaigns. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

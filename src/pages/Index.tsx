import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-primary shadow-glow">
              <MessageSquare className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            AI Chat Assistant
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of conversation with our advanced AI chat platform. 
            Get instant responses, creative solutions, and intelligent assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow font-medium px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-border hover:bg-muted">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg bg-gradient-card border border-border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary mb-4 mx-auto">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Get instant responses with our optimized AI infrastructure</p>
            </div>
            
            <div className="p-6 rounded-lg bg-gradient-card border border-border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary mb-4 mx-auto">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your conversations are encrypted and completely private</p>
            </div>
            
            <div className="p-6 rounded-lg bg-gradient-card border border-border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-User Support</h3>
              <p className="text-muted-foreground">Collaborate with teams and share conversation history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

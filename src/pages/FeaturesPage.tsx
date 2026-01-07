import { Navbar } from '@/components/landing/Navbar';
import { Features as FeaturesSection } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Powerful Features for AI Governance
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to secure, monitor, and control AI usage across your organization.
          </p>
        </div>
        <FeaturesSection />
        
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-muted-foreground mb-8">
              Try our live demo to experience PolicyShield's capabilities firsthand.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild>
                <Link to="/auth?mode=signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/demo">Live Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

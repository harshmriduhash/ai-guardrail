import { Navbar } from '@/components/landing/Navbar';
import { Pricing as PricingSection } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: 'How does the free tier work?',
    answer: 'The free tier gives you 100 API calls per month, access to basic policy types, and 7-day log retention. No credit card required. Perfect for exploring PolicyShield and small projects.'
  },
  {
    question: 'What counts as an API call?',
    answer: 'Each LLM request that passes through the PolicyShield proxy counts as one API call, regardless of whether it\'s allowed or blocked. Policy evaluation, logging, and the actual LLM call are all included.'
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at your next billing cycle.'
  },
  {
    question: 'What LLM providers are supported?',
    answer: 'PolicyShield works with OpenAI (GPT-4, GPT-3.5), Anthropic (Claude), Google (Gemini), and more. Pro and Enterprise plans support all major providers. We\'re constantly adding new integrations.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is encrypted in transit and at rest. We\'re SOC 2 Type II certified, GDPR compliant, and never train on your data. Enterprise customers can opt for on-premise deployment.'
  },
  {
    question: 'How do I integrate PolicyShield?',
    answer: 'Integration takes about 5 minutes. Simply point your LLM API calls to our proxy endpoint and add your API key. We provide SDKs for Python, JavaScript, Go, and more.'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. Transparent pricing with no hidden fees.
          </p>
        </div>
        
        <PricingSection />
        
        {/* FAQ Section */}
        <section className="py-16 bg-card">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// import { Link } from "react-router-dom";
import { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Section } from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "Frequently Asked Questions",
  items = [
    {
      question:
        "What makes Aura Campaigns different from other email marketing tools?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Aura Campaigns combines a visual drag-and-drop campaign builder,
            intelligent automation, and real-time analytics in one seamless
            platform. No more juggling multiple tools or complex setups—just
            results.
          </p>
        </>
      ),
    },
    {
      question: "How quickly can I launch my first campaign?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            You can import leads, design your sequence, and schedule your first
            campaign in minutes. Our intuitive workflow designer and smart
            templates make setup effortless—even for beginners.
          </p>
        </>
      ),
    },
    {
      question: "Can I track every email and lead in real time?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes! Instantly see who opened, clicked, or bounced. Monitor campaign
            performance, delivery rates, and lead engagement—all in a single
            dashboard.
          </p>
        </>
      ),
    },
    {
      question: "Is Aura Campaigns secure and compliant?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Absolutely. We use enterprise-grade security, GDPR and CAN-SPAM
            compliance, and encrypted cloud storage. Your data and reputation
            are always protected.
          </p>
        </>
      ),
    },
    {
      question: "Can I try Aura Campaigns for free?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes! Sign up now and experience the full power of Aura Campaigns
            with a free trial—no credit card required. See how easy professional
            email marketing can be.
          </p>
        </>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}

'use client'

import { useState, useEffect } from 'react'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { FAQ } from '@/lib/types'

// Fallback FAQs shown when database is empty or unavailable
const fallbackFaqs: FAQ[] = [
  { id: '1', question: 'What is EnglishMaster?', answer: 'EnglishMaster is an online English learning platform designed specifically for students from Standards 6 to 12. We provide comprehensive study materials, video tutorials, reading resources, and practice tests to help students master the English language.' },
  { id: '2', question: 'Do I need to register to access the content?', answer: 'While you can browse our standards and preview some content without registering, you need to create a free account to access all study materials, videos, practice tests, and other learning resources.' },
  { id: '3', question: 'Is the platform free to use?', answer: 'Yes, EnglishMaster offers free access to a wide range of learning resources. We believe quality English education should be accessible to all students.' },
  { id: '4', question: 'How do I select my standard/class?', answer: 'After signing up and logging in, you can navigate to the Standards page and select your academic standard. You will then have access to all English learning resources specific to your curriculum.' },
  { id: '5', question: 'What type of content is available?', answer: 'We offer textbooks, reading materials, practice tests, and video tutorials covering all aspects of English learning for each standard.' },
  { id: '6', question: 'Can I ask doubts or questions?', answer: 'Yes! We have an "Ask Query" feature where students can submit their English-related doubts. Our team reviews and responds to queries to help clarify your understanding.' },
]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFaqs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (!error && data && data.length > 0) {
        setFaqs(data)
      }
      setLoading(false)
    }
    fetchFaqs()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                Find answers to common questions about EnglishMaster and how to make the most of your learning experience.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

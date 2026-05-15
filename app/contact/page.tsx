'use client'

import { useState } from 'react'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                Have questions or feedback? We&apos;d love to hear from you. Get in touch with our team.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Whether you have a question about our platform, need help with your account, or want to share feedback, we&apos;re here to help. Reach out to us using the contact form or through our contact details below.
                </p>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Email</h3>
                        <p className="text-sm text-muted-foreground">support@englishmaster.com</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Phone</h3>
                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Address</h3>
                        <p className="text-sm text-muted-foreground">Mumbai, Maharashtra, India</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Support Hours</h3>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p className="text-sm text-muted-foreground">Saturday: 10:00 AM - 4:00 PM IST</p>
                  <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-accent" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
                        </p>
                        <Button onClick={() => {
                          setIsSubmitted(false)
                          setFormState({ name: '', email: '', subject: '', message: '' })
                        }}>
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                              id="name" 
                              placeholder="Your name"
                              value={formState.name}
                              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="you@example.com"
                              value={formState.email}
                              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input 
                            id="subject" 
                            placeholder="How can we help you?"
                            value={formState.subject}
                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Write your message here..."
                            rows={5}
                            value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            required
                          />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            'Sending...'
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

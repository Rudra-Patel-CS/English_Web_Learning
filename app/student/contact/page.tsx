'use client'

import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export default function StudentContactPage() {
  return (
    <div className="min-h-screen">
      <StudentHeader title="Contact Us" subtitle="Get in touch with our team" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-10 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-10 w-5 h-5 rounded-full bg-blue-400/20 animate-float" />
            <div className="absolute bottom-6 left-12 w-7 h-7 rounded-full bg-indigo-400/15 animate-float-reverse" />
          </div>
          <div className="relative">
            <Phone className="h-12 w-12 mx-auto text-primary/60 mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="stat-card-3d border-0 shadow-md">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">support@englishmaster.com</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card-3d border-0 shadow-md">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card-3d border-0 shadow-md">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Address</h3>
                <p className="text-sm text-muted-foreground">Mumbai, Maharashtra, India</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Hours */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Support Hours</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Monday - Friday</p>
                <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM IST</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Saturday</p>
                <p className="text-sm text-muted-foreground">10:00 AM - 4:00 PM IST</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Sunday</p>
                <p className="text-sm text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

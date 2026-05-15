import Link from 'next/link'
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">EnglishMaster</span>
            </Link>
            <p className="text-sm text-navy-foreground/70 leading-relaxed">
              Learn English smarter with structured resources, videos, reading materials, and practice tests.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              <li><Link href="/" className="hover:text-navy-foreground transition-colors">Home</Link></li>
              <li><Link href="/standards" className="hover:text-navy-foreground transition-colors">Standards</Link></li>
              <li><Link href="/about" className="hover:text-navy-foreground transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-navy-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              <li><Link href="/standards" className="hover:text-navy-foreground transition-colors">Study Materials</Link></li>
              <li><Link href="/standards" className="hover:text-navy-foreground transition-colors">Video Tutorials</Link></li>
              <li><Link href="/standards" className="hover:text-navy-foreground transition-colors">Practice Tests</Link></li>
              <li><Link href="/standards" className="hover:text-navy-foreground transition-colors">Text Books</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-navy-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@englishmaster.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-foreground/10 mt-8 pt-8 text-center text-sm text-navy-foreground/60">
          <p>&copy; {new Date().getFullYear()} EnglishMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

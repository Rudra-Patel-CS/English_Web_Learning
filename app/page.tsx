import Link from 'next/link'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Video, 
  FileText, 
  PenTool, 
  GraduationCap, 
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section with 3D Elements */}
        <section className="relative py-20 md:py-32 overflow-hidden animated-gradient-bg">
          {/* Floating 3D Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Floating Pencil */}
            <div className="absolute top-12 md:top-20 -left-10 md:left-[8%] animate-float opacity-30 md:opacity-60 scale-[0.4] md:scale-100 origin-left">
              <div className="threed-pencil" />
            </div>
            
            {/* Floating Book */}
            <div className="absolute top-24 md:top-32 -right-12 md:right-[10%] animate-float-slow opacity-25 md:opacity-50 scale-[0.4] md:scale-100 origin-right">
              <div className="threed-book" />
            </div>
            
            {/* Small floating circles */}
            <div className="absolute top-16 right-[30%] w-6 h-6 rounded-full bg-blue-400/30 animate-float delay-300" />
            <div className="absolute bottom-32 left-[15%] w-10 h-10 rounded-full bg-purple-400/20 animate-float-reverse delay-500" />
            <div className="absolute top-40 left-[40%] w-4 h-4 rounded-full bg-emerald-400/30 animate-float-slow delay-200" />
            <div className="absolute bottom-20 right-[25%] w-8 h-8 rounded-full bg-amber-400/25 animate-float delay-700" />
            
            {/* Floating ABC text */}
            <div className="absolute bottom-28 left-[25%] animate-float-slow delay-400 opacity-20">
              <span className="text-6xl font-black text-primary/30 select-none">A</span>
            </div>
            <div className="absolute top-24 right-[22%] animate-float-reverse delay-100 opacity-15">
              <span className="text-5xl font-black text-purple-500/30 select-none">B</span>
            </div>
            <div className="absolute bottom-16 right-[40%] animate-float delay-600 opacity-15">
              <span className="text-4xl font-black text-emerald-500/30 select-none">C</span>
            </div>

            {/* Floating Pencil 2 - right side */}
            <div className="absolute bottom-20 md:bottom-40 -right-16 md:right-[8%] animate-float-reverse opacity-20 md:opacity-40 scale-[0.4] md:scale-100 origin-right">
              <div className="threed-pencil" style={{ transform: 'rotate(15deg) scale(0.7)' }} />
            </div>

            {/* Dotted circle decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-dashed border-primary/10 animate-spin-slow" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary text-sm font-medium mb-8 animate-slide-up">
                <Sparkles className="h-4 w-4" />
                <span>English Learning Platform for Standards 6-12</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight text-balance mb-6 animate-slide-up delay-100">
                Master English with{' '}
                <span className="gradient-text">EnglishMaster</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 text-pretty animate-slide-up delay-200 max-w-2xl mx-auto">
                Access comprehensive study materials, video tutorials, reading resources, and practice tests designed to help you excel in English across all academic standards.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
                <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/signin">
                    Sign In
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 py-6 glass-card hover:bg-white/80">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with 3D Cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Everything You Need to <span className="gradient-text">Master English</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Four pillars of learning designed to help you succeed
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FileText, title: 'Reading Material', desc: 'Curated passages, worksheets, and reference documents to boost reading skills.', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
                { icon: BookOpen, title: 'Textbooks', desc: 'Access complete textbook PDFs and study guides for every standard.', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                { icon: PenTool, title: 'Practice Tests', desc: 'Chapter-wise quizzes and mock exams to test your knowledge.', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
                { icon: Video, title: 'Video Links', desc: 'Expert-led video lessons covering grammar, comprehension and more.', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
              ].map((feature, i) => (
                <div key={feature.title} className={`stat-card-3d rounded-2xl border border-border/50 p-8 ${feature.bg} animate-slide-up`} style={{ animationDelay: `${i * 100 + 200}ms` }}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Standards Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Standards <span className="gradient-text">6 to 12</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Content curated for every academic standard
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 max-w-4xl mx-auto">
              {[6, 7, 8, 9, 10, 11, 12].map((std, i) => (
                <div
                  key={std}
                  className="stat-card-3d rounded-2xl bg-white border border-border/50 p-6 flex flex-col items-center justify-center text-center shadow-sm animate-scale-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 shadow-md">
                    <span className="text-xl font-bold text-white">{std}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Std {std}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-10 -right-16 md:right-10 animate-float opacity-15 md:opacity-30 scale-[0.4] md:scale-100 origin-right">
            <div className="threed-book" style={{ transform: 'perspective(500px) rotateY(-15deg) scale(0.8)' }} />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-primary/30 mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Ready to Improve Your English?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Join thousands of students who are already learning with EnglishMaster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="shadow-lg">
                  <Link href="/signup">
                    Create Free Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Target, Users, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                About EnglishMaster
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                We are dedicated to helping students across India master the English language through structured, accessible, and engaging learning resources.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  EnglishMaster was founded with a simple yet powerful mission: to make quality English education accessible to every student, regardless of their location or background.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We believe that proficiency in English opens doors to countless opportunities in academics, careers, and personal growth. Our platform bridges the gap between traditional classroom learning and the dynamic needs of modern students.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Through carefully curated content, interactive practice tests, and engaging video tutorials, we empower students from Standards 6 to 12 to build a strong foundation in English grammar, reading, and writing.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <Target className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Our Goal</h3>
                    <p className="text-sm text-muted-foreground">Help every student achieve English proficiency</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-accent/20 mt-6">
                  <CardContent className="p-6">
                    <Users className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Our Community</h3>
                    <p className="text-sm text-muted-foreground">10,000+ students learning together</p>
                  </CardContent>
                </Card>
                <Card className="border-muted">
                  <CardContent className="p-6">
                    <BookOpen className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Our Content</h3>
                    <p className="text-sm text-muted-foreground">Curriculum-aligned resources for all standards</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted mt-6">
                  <CardContent className="p-6">
                    <Heart className="h-10 w-10 text-destructive mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Our Passion</h3>
                    <p className="text-sm text-muted-foreground">Dedicated to student success</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Accessibility</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quality education should be accessible to all. We strive to make our platform available and affordable for every student who wants to learn.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every piece of content on our platform is created by experienced educators and reviewed to ensure accuracy and effectiveness.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We continuously improve our platform with new features, content, and learning methods to enhance the student experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Meet the Creator</h2>
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">EM</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">EnglishMaster Team</h3>
              <p className="text-muted-foreground mb-6">Founder &amp; Lead Educator</p>
              <p className="text-muted-foreground leading-relaxed">
                With years of experience in English education and a passion for helping students succeed, the EnglishMaster team has created this platform to bring quality English learning resources to students across all academic standards. Our vision is to make English learning engaging, effective, and accessible for everyone.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

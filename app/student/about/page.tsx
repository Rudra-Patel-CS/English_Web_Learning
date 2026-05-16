'use client'

import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Target, Users, Heart, GraduationCap } from 'lucide-react'

export default function StudentAboutPage() {
  return (
    <div className="min-h-screen">
      <StudentHeader title="About Us" subtitle="Learn more about EnglishMaster" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden animated-gradient-bg p-10 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-6 -right-16 md:right-12 animate-float opacity-15 md:opacity-30 scale-[0.4] md:scale-100 origin-right">
              <div className="threed-book" style={{ transform: 'perspective(500px) rotateY(-15deg) scale(0.6)' }} />
            </div>
            <div className="absolute bottom-4 left-10 w-6 h-6 rounded-full bg-primary/15 animate-float-slow" />
          </div>
          <div className="relative">
            <GraduationCap className="h-16 w-16 mx-auto text-primary/60 mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">About EnglishMaster</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We are dedicated to helping students across India master the English language through structured, accessible, and engaging learning resources.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
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
            <Card className="stat-card-3d bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Our Goal</h4>
                <p className="text-sm text-muted-foreground">Help every student achieve English proficiency</p>
              </CardContent>
            </Card>
            <Card className="stat-card-3d bg-accent/5 border-accent/20 mt-6">
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-accent mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Our Community</h4>
                <p className="text-sm text-muted-foreground">10,000+ students learning together</p>
              </CardContent>
            </Card>
            <Card className="stat-card-3d border-muted">
              <CardContent className="p-6">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Our Content</h4>
                <p className="text-sm text-muted-foreground">Curriculum-aligned resources for all standards</p>
              </CardContent>
            </Card>
            <Card className="stat-card-3d bg-muted mt-6">
              <CardContent className="p-6">
                <Heart className="h-10 w-10 text-destructive mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Our Passion</h4>
                <p className="text-sm text-muted-foreground">Dedicated to student success</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Accessibility', desc: 'Quality education should be accessible to all. We strive to make our platform available and affordable for every student who wants to learn.' },
              { num: '2', title: 'Quality', desc: 'Every piece of content on our platform is created by experienced educators and reviewed to ensure accuracy and effectiveness.' },
              { num: '3', title: 'Innovation', desc: 'We continuously improve our platform with new features, content, and learning methods to enhance the student experience.' },
            ].map((v) => (
              <div key={v.num} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{v.num}</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{v.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

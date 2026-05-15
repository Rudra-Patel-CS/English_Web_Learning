'use client'

import { useState } from 'react'
import { StudentHeader } from '@/components/student/student-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Send, 
  Clock, 
  CheckCircle,
  MessageSquare,
  Loader2
} from 'lucide-react'

const categories = [
  'Grammar Doubt',
  'Writing Help',
  'Vocabulary Question',
  'Comprehension Help',
  'Speaking/Pronunciation',
  'Other',
]

const previousQueries = [
  { 
    id: 1, 
    question: 'What is the difference between "affect" and "effect"?',
    category: 'Vocabulary Question',
    status: 'answered',
    date: '2 days ago',
    answer: '"Affect" is usually a verb meaning to influence something, while "effect" is usually a noun meaning the result of an influence. Example: The weather can affect your mood. The effect of the rain was flooding.',
  },
  { 
    id: 2, 
    question: 'How do I convert a sentence from active to passive voice?',
    category: 'Grammar Doubt',
    status: 'answered',
    date: '5 days ago',
    answer: 'To convert active to passive: 1) Make the object of the active sentence the subject. 2) Use the appropriate form of "be" + past participle. 3) The subject of the active sentence becomes the agent (with "by"). Example: Active: "The cat caught the mouse" → Passive: "The mouse was caught by the cat".',
  },
  { 
    id: 3, 
    question: 'Can you explain the use of articles (a, an, the)?',
    category: 'Grammar Doubt',
    status: 'pending',
    date: '1 day ago',
    answer: null,
  },
]

export default function AskQueryPage() {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    question: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ category: '', subject: '', question: '' })
  }

  return (
    <div>
      <StudentHeader 
        title="Ask a Query"
        subtitle="Get help with your English learning doubts"
      />
      
      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submit Query Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Submit a New Query
              </CardTitle>
              <CardDescription>
                Ask any English-related question and our team will respond within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Query Submitted!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your question has been received. We&apos;ll respond within 24-48 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>
                    Ask Another Question
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject/Topic</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Tenses, Voice, Articles"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question">Your Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Describe your doubt in detail..."
                      rows={5}
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Query
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Previous Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Your Previous Queries
              </CardTitle>
              <CardDescription>
                View your submitted questions and their answers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousQueries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You haven&apos;t asked any questions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previousQueries.map((query) => (
                    <div 
                      key={query.id} 
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <div 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedQuery(expandedQuery === query.id ? null : query.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-foreground line-clamp-2">{query.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {query.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {query.date}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            variant={query.status === 'answered' ? 'default' : 'outline'}
                            className={query.status === 'answered' ? 'bg-accent text-accent-foreground' : ''}
                          >
                            {query.status === 'answered' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      {expandedQuery === query.id && query.answer && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="p-3 rounded-lg bg-accent/5 border-l-2 border-accent">
                            <p className="text-xs font-medium text-accent mb-1">Answer:</p>
                            <p className="text-sm text-foreground">{query.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Asking Good Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium text-foreground mb-1">Be Specific</h4>
                <p className="text-sm text-muted-foreground">Clearly state the topic and what exactly you&apos;re confused about.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium text-foreground mb-1">Give Examples</h4>
                <p className="text-sm text-muted-foreground">Include example sentences where applicable.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium text-foreground mb-1">One Topic at a Time</h4>
                <p className="text-sm text-muted-foreground">Ask about one concept per query for clearer answers.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-medium text-foreground mb-1">Check Previous Answers</h4>
                <p className="text-sm text-muted-foreground">Your question might already be answered in your history.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - you can integrate with your backend or email service
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen py-20 sm:py-24 bg-background">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 sm:border-3 border-[#1a1a1a] font-bold text-xs sm:text-sm transition-all hover:shadow-md mb-6 sm:mb-8" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl font-black inline-block bg-[#ff6b9d] border-3 border-[#1a1a1a] px-6 py-3 -rotate-1 shadow-md">Contact Us</h1>
            <p className="text-lg font-medium">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border-3 border-[#1a1a1a] p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary border-2 border-[#1a1a1a] flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="text-sm text-muted-foreground">We'll respond within 24-48 hours</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/50 p-6 space-y-3">
                <h3 className="font-semibold">Before contacting us:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Check our <Link href="/faq" className="text-foreground underline">FAQ page</Link> for quick answers</li>
                  <li>• Review our <Link href="/terms" className="text-foreground underline">Terms of Service</Link></li>
                  <li>• Read our <Link href="/privacy" className="text-foreground underline">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <textarea
                    id="message"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="flex w-full rounded-2xl border border-input bg-background px-4 py-3 text-base shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

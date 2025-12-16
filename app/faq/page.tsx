import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'FAQ - grabit2me',
  description: 'Frequently asked questions about grabit2me video downloader',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How does grabit2me work?</h2>
            <p className="text-muted-foreground">
              Simply paste the URL of the video you want to download, click "Fetch Video", and once the video is processed, click the download button. Our service retrieves publicly available content from social media platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Which platforms are supported?</h2>
            <p className="text-muted-foreground">
              Currently, we support Instagram, X (Twitter), Threads, LinkedIn, Snapchat, and YouTube. We're working on adding more platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Is grabit2me free to use?</h2>
            <p className="text-muted-foreground">
              Yes! grabit2me is completely free to use. No registration, no subscriptions, no hidden fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Do I need to create an account?</h2>
            <p className="text-muted-foreground">
              No account is required. You can use grabit2me anonymously without signing up or logging in.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Are there watermarks on downloaded videos?</h2>
            <p className="text-muted-foreground">
              No, we don't add any watermarks to the videos you download. You get the original content as it appears on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Can I download private or restricted content?</h2>
            <p className="text-muted-foreground">
              No, our service only works with publicly available content. We cannot access private accounts or restricted videos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">What video quality can I download?</h2>
            <p className="text-muted-foreground">
              The available quality depends on the source platform. For platforms like YouTube, we offer multiple quality options. For others, we provide the best available quality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Is it legal to download videos?</h2>
            <p className="text-muted-foreground">
              You should only download content that you have permission to use or that is in the public domain. Always respect copyright laws and content creators' rights. We recommend using downloaded content for personal, non-commercial purposes only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Do you store the videos I download?</h2>
            <p className="text-muted-foreground">
              No, we do not store any videos. All processing happens in real-time, and we don't keep any copies of the content you download.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Why isn't my download working?</h2>
            <p className="text-muted-foreground">
              Common issues include: the video is private, the URL is incorrect, or the content has been removed from the platform. Make sure you're using a valid, public video URL. If problems persist, try a different video or contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Can I download videos in bulk?</h2>
            <p className="text-muted-foreground">
              Currently, we process one video at a time to ensure quality and prevent abuse. For bulk downloads, you'll need to process each URL separately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Is there a download limit?</h2>
            <p className="text-muted-foreground">
              We implement fair usage policies to ensure service availability for all users. Excessive usage may be temporarily restricted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How can I contact support?</h2>
            <p className="text-muted-foreground">
              You can reach us through our <Link href="/contact" className="text-foreground underline">contact page</Link>. We'll do our best to respond to your inquiry as quickly as possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Is grabit2me safe to use?</h2>
            <p className="text-muted-foreground">
              Yes, our service is safe. We don't require personal information, don't install any software on your device, and don't store your data. Always ensure you're on the official grabit2me website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

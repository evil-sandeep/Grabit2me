import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Disclaimer - grabit2me',
  description: 'Disclaimer for grabit2me video downloader service',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">General Information</h2>
            <p>
              grabit2me is a video downloading service that allows users to download publicly available content from various social media platforms. By using our service, you acknowledge and agree to this disclaimer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Content Ownership</h2>
            <p>
              We do not host, store, or own any content downloaded through our service. All content belongs to their respective copyright holders. Users are responsible for ensuring they have the right to download and use any content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibility</h2>
            <p>
              Users must comply with all applicable laws and regulations, including copyright laws. We are not responsible for how users utilize downloaded content. You should only download content that you have permission to use or that is in the public domain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
            <p>
              We strive to provide reliable service but do not guarantee uninterrupted access. The service is provided "as is" without warranties of any kind, either express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Platforms</h2>
            <p>
              grabit2me is not affiliated with, endorsed by, or sponsored by Instagram, X (Twitter), YouTube, LinkedIn, Snapchat, Threads, or any other social media platform. All trademarks belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, grabit2me shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Disclaimer</h2>
            <p>
              We reserve the right to modify this disclaimer at any time. Continued use of the service after changes constitutes acceptance of the modified disclaimer.
            </p>
          </section>

          <p className="text-sm mt-8">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
            aria-label="Go back to home"
          >
            <FaArrowLeft className="text-white" />
          </Link>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-orange-500 text-xl" />
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <p className="text-zinc-400 mb-8">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-zinc-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to ShoeSwiper (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed
              to protecting your personal data. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our mobile application and website (collectively,
              the &quot;Service&quot;).
            </p>
            <p>
              Please read this Privacy Policy carefully. By using the Service, you agree to the collection
              and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>

            <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
            <p className="mb-4">When you create an account or use our Service, we may collect:</p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile photo (if uploaded)</li>
              <li>Authentication credentials (securely hashed)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2">Usage Data</h3>
            <p className="mb-4">We automatically collect certain information when you use our Service:</p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Device information (device type, operating system)</li>
              <li>Browser type and version</li>
              <li>Pages visited and features used</li>
              <li>Time spent on pages</li>
              <li>Sneaker preferences and swipe history</li>
              <li>Search queries</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2">Outfit Photos</h3>
            <p>
              When you use our &quot;Check My Fit&quot; feature, photos you upload are processed temporarily to
              provide AI-powered outfit recommendations. These images are not permanently stored and are
              deleted after processing.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Personalize your sneaker recommendations</li>
              <li>Process your requests and transactions</li>
              <li>Send you updates, alerts, and promotional content (with your consent)</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Affiliate Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Affiliate Disclosure</h2>
            <p className="mb-4">
              ShoeSwiper participates in affiliate programs, including the Amazon Associates Program.
              When you click on product links and make a purchase, we may earn a commission at no
              additional cost to you.
            </p>
            <p>
              As an Amazon Associate, we earn from qualifying purchases. Product prices and availability
              are accurate as of the date/time indicated and are subject to change.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Share Your Information</h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our Service (hosting, analytics, email delivery)</li>
              <li><strong>Affiliate Partners:</strong> When you click affiliate links, partners may receive referral data</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption
              in transit and at rest, secure authentication protocols, and regular security audits.
              However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at the email below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and
              hold certain information. Cookies are files with small amounts of data that may include
              an anonymous unique identifier. You can instruct your browser to refuse all cookies or
              to indicate when a cookie is being sent.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children&apos;s Privacy</h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian
              and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: dadsellsgadgets@gmail.com</li>
              <li>Website: <Link to="/" className="text-orange-500 hover:underline">shoeswiper.com</Link></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

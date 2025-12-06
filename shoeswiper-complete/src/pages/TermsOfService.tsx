import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';

const TermsOfService: React.FC = () => {
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
            <FaFileContract className="text-orange-500 text-xl" />
            <h1 className="text-xl font-bold">Terms of Service</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <p className="text-zinc-400 mb-8">Last Updated: {lastUpdated}</p>

        <div className="space-y-8 text-zinc-300">
          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of ShoeSwiper,
              including our website and mobile application (collectively, the &quot;Service&quot;). By
              accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you may not access or use the Service. We may
              modify these Terms at any time, and your continued use of the Service constitutes
              acceptance of any modifications.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Description of Service</h2>
            <p className="mb-4">
              ShoeSwiper is a sneaker discovery platform that helps users find sneakers through a
              swipe-based interface. Our Service includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>TikTok-style sneaker browsing with swipe functionality</li>
              <li>AI-powered outfit matching recommendations</li>
              <li>Virtual sneaker closet to save favorites</li>
              <li>Price alerts and notifications</li>
              <li>Links to purchase products from affiliate partners</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Service. If you are under 18, you represent
              that you have your parent or guardian&apos;s permission to use the Service. By using the
              Service, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">User Accounts</h2>
            <p className="mb-4">
              To access certain features, you may need to create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          {/* Affiliate Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Affiliate Disclosure & Purchases</h2>
            <p className="mb-4">
              <strong>Important:</strong> ShoeSwiper is a product discovery platform, not a retailer.
              When you click on product links, you will be redirected to third-party retailers
              (such as Amazon) to complete your purchase.
            </p>
            <p className="mb-4">
              ShoeSwiper participates in the Amazon Associates Program and other affiliate programs.
              We earn commissions on qualifying purchases made through our links at no additional
              cost to you.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All purchases are made directly with the retailer, not ShoeSwiper</li>
              <li>Product prices and availability are determined by the retailer</li>
              <li>Returns, refunds, and customer service are handled by the retailer</li>
              <li>We are not responsible for products purchased through affiliate links</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Acceptable Use</h2>
            <p className="mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights of others</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape, crawl, or harvest data without permission</li>
              <li>Use automated systems or bots to access the Service</li>
              <li>Impersonate others or provide false information</li>
              <li>Engage in any fraudulent or deceptive practices</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content, features, and functionality are owned by ShoeSwiper
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws.
            </p>
            <p>
              Sneaker images, brand names, and product information displayed on the Service are the
              property of their respective owners. Their use on our platform does not imply endorsement
              or affiliation unless explicitly stated.
            </p>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">User Content</h2>
            <p className="mb-4">
              When you upload content (such as outfit photos for the Check My Fit feature), you grant
              us a limited license to process that content solely for the purpose of providing the Service.
            </p>
            <p>
              You represent that you own or have the right to use any content you upload and that such
              content does not violate the rights of any third party.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Disclaimers</h2>
            <p className="mb-4 uppercase text-sm">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mb-4">We do not warrant that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Product information or prices are accurate or up-to-date</li>
              <li>AI recommendations will meet your preferences or needs</li>
              <li>Any defects will be corrected</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="uppercase text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHOESWIPER SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
              REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
              OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR ACCESS TO OR USE OF THE SERVICE.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless ShoeSwiper and its officers, directors, employees,
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees)
              arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice,
              for any reason, including breach of these Terms. Upon termination, your right to use the
              Service will cease immediately. Provisions that by their nature should survive termination
              shall survive.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions. Any disputes arising from these Terms shall
              be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              shall be limited or eliminated to the minimum extent necessary, and the remaining provisions
              shall remain in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: dadsellsgadgets@gmail.com</li>
              <li>Website: <Link to="/" className="text-orange-500 hover:underline">shoeswiper.com</Link></li>
            </ul>
          </section>

          {/* Link to Privacy Policy */}
          <section className="pt-4 border-t border-zinc-800">
            <p>
              Please also review our{' '}
              <Link to="/privacy" className="text-orange-500 hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect and use your information.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;

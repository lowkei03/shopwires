export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-brand-600">ShopWires</a>
        <a href="/auth/signup" className="btn-primary text-sm">Get started</a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: August 17, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p>ShopWires ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform. Please read this policy carefully. By using ShopWires, you agree to the practices described here.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Information you provide directly:</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Account information: name, email address, password</li>
              <li>Business information: shop name, business type, phone number, address</li>
              <li>Billing information: processed securely through Stripe — we do not store full card numbers</li>
              <li>Twilio credentials: Account SID, Auth Token, and phone number stored to enable SMS delivery</li>
              <li>Customer data you import: phone numbers, names, birthdays, and notes you add about your customers</li>
            </ul>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Information collected automatically:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usage data: pages visited, features used, and actions taken within the platform</li>
              <li>Log data: IP address, browser type, and timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain the ShopWires platform</li>
              <li>To process payments through Stripe</li>
              <li>To send SMS messages on your behalf through Twilio</li>
              <li>To communicate with you about your account, updates, and support</li>
              <li>To improve the platform and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Your Customers' Data</h2>
            <p>When you use ShopWires, you upload and manage data about your customers (phone numbers, names, birthdays, etc.). You are the data controller for your customers' personal information. ShopWires acts as a data processor — we store and process this data only to provide the Service to you.</p>
            <p className="mt-3">You are responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Obtaining proper consent from your customers before adding them to your list</li>
              <li>Honoring your customers' requests to opt out or have their data deleted</li>
              <li>Complying with applicable privacy laws regarding your customers' personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Sharing of Information</h2>
            <p>We do not sell your information or your customers' information. We share data only with:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Twilio:</strong> Phone numbers and message content are transmitted to Twilio to deliver SMS messages. Twilio's privacy policy applies to their handling of this data.</li>
              <li><strong>Stripe:</strong> Billing information is processed by Stripe. We share only what is necessary to process payments.</li>
              <li><strong>Supabase:</strong> We use Supabase to host our database. Your data is stored on Supabase infrastructure.</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or to protect the rights, property, or safety of ShopWires or others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect your information, including encrypted data transmission (HTTPS), row-level security on our database, and restricted access to sensitive credentials. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. If you cancel your account, we will delete your data within 90 days, except where we are required to retain it for legal or regulatory reasons.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at the email below. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Children's Privacy</h2>
            <p>ShopWires is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice in the platform. Continued use of ShopWires after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:<br />
            <strong>ShopWires</strong><br />
            Soddy Daisy, Tennessee<br />
            <a href="mailto:keith.lowery@scenicautotech.com" className="text-brand-600 hover:underline">keith.lowery@scenicautotech.com</a></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-6">
          <a href="/legal/terms" className="hover:text-slate-600">Terms of Service</a>
          <a href="/legal/sms" className="hover:text-slate-600">SMS Messaging Terms</a>
          <a href="/" className="hover:text-slate-600">Home</a>
        </div>
      </footer>
    </div>
  );
}

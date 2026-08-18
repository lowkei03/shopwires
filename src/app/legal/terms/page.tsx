export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-brand-600">ShopWires</a>
        <a href="/auth/signup" className="btn-primary text-sm">Get started</a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: August 17, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("Merchant," "you," or "your") and ShopWires ("ShopWires," "we," "us," or "our"), a business based in Soddy Daisy, Tennessee. By accessing or using ShopWires, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
            <p>ShopWires is a software-as-a-service (SaaS) platform that enables local retail businesses to build and manage SMS-based customer loyalty programs. The Service allows merchants to collect customer opt-ins via SMS keyword, manage customer lists, and send automated and manual SMS campaigns through third-party SMS providers (currently Twilio).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Accounts and Registration</h2>
            <p>To use ShopWires, you must create an account with a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at least 18 years old and have the legal authority to enter into this agreement on behalf of your business.</p>
            <p className="mt-3">You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Acceptable Use — SMS Messaging</h2>
            <p>By using ShopWires to send SMS messages, you agree to the following:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>You will only send messages to customers who have expressly opted in by texting your assigned keyword to your Twilio phone number.</li>
              <li>You will honor all opt-out requests immediately. Customers who reply STOP must not receive further messages.</li>
              <li>You will comply with all applicable laws and regulations governing commercial SMS messaging, including the Telephone Consumer Protection Act (TCPA), the CAN-SPAM Act, and all applicable FCC rules and regulations.</li>
              <li>You will not send unsolicited messages, spam, or messages to purchased or rented lists.</li>
              <li>You will not use ShopWires to send messages that are illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</li>
              <li>You will not misrepresent your identity or the nature of your messages.</li>
              <li>You are solely responsible for the content of all messages sent through your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Third-Party SMS Provider (Twilio)</h2>
            <p>ShopWires integrates with Twilio to deliver SMS messages. You are required to create and maintain your own Twilio account and provide your own Twilio credentials. By using the SMS features of ShopWires, you also agree to Twilio's Terms of Service and Acceptable Use Policy, available at twilio.com. ShopWires is not responsible for the availability, reliability, or cost of Twilio services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Subscription and Billing</h2>
            <p>ShopWires offers subscription plans billed monthly. Your subscription begins after your 30-day free trial ends. You authorize ShopWires to charge your payment method on a recurring monthly basis until you cancel. All fees are non-refundable except as required by law.</p>
            <p className="mt-3">You may cancel your subscription at any time through the billing portal. Cancellation takes effect at the end of your current billing period. ShopWires reserves the right to modify pricing with 30 days' notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Intellectual Property</h2>
            <p>ShopWires and its original content, features, and functionality are and will remain the exclusive property of ShopWires. You retain ownership of any customer data you upload to the platform. You grant ShopWires a limited license to use your data solely to provide the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Data and Privacy</h2>
            <p>Your use of ShopWires is also governed by our Privacy Policy, which is incorporated into these Terms by reference. You are responsible for ensuring you have the appropriate consents and legal basis to share your customers' data with ShopWires.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Disclaimer of Warranties</h2>
            <p>ShopWires is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. Your use of the Service is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, ShopWires shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or relating to your use of the Service. Our total liability to you for any claim shall not exceed the amount you paid to ShopWires in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless ShopWires and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of your use of the Service, your violation of these Terms, or your violation of any applicable law including TCPA.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Termination</h2>
            <p>ShopWires reserves the right to suspend or terminate your account at any time for violation of these Terms, non-payment, or any conduct that we determine is harmful to the Service or other users. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Tennessee, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts located in Hamilton County, Tennessee.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by email or by posting a notice in the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">15. Contact</h2>
            <p>Questions about these Terms should be directed to:<br />
            <strong>ShopWires</strong><br />
            Soddy Daisy, Tennessee<br />
            <a href="mailto:keith.lowery@scenicautotech.com" className="text-brand-600 hover:underline">keith.lowery@scenicautotech.com</a></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-6">
          <a href="/legal/privacy" className="hover:text-slate-600">Privacy Policy</a>
          <a href="/legal/sms" className="hover:text-slate-600">SMS Messaging Terms</a>
          <a href="/" className="hover:text-slate-600">Home</a>
        </div>
      </footer>
    </div>
  );
}

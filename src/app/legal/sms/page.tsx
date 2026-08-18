export default function SMSTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-brand-600">ShopWires</a>
        <a href="/auth/signup" className="btn-primary text-sm">Get started</a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">SMS Messaging Terms</h1>
        <p className="text-sm text-slate-400 mb-4">Last updated: August 17, 2026</p>
        <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 mb-10">
          <p className="text-sm text-brand-800 font-medium">For merchants using ShopWires</p>
          <p className="text-sm text-brand-700 mt-1">This page describes the SMS messaging terms that apply to your customers when they opt in to your loyalty program through ShopWires. You are required to direct your customers here or make this information available to them.</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Program Description</h2>
            <p>ShopWires powers SMS loyalty programs for local retail businesses. When a customer texts a shop's keyword to a participating merchant's SMS number, that customer opts into the merchant's loyalty program and agrees to receive SMS messages from that merchant.</p>
            <p className="mt-3">Messages may include: loyalty offers, win-back promotions, birthday offers, flash deals, and other marketing messages relevant to the merchant's business.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Opt In</h2>
            <p>Customers opt in by texting a merchant's unique keyword (for example, BREWS or CUTS) to the merchant's designated SMS phone number. By sending this text, customers expressly consent to receive recurring automated marketing text messages from that merchant at the mobile number used to opt in.</p>
            <p className="mt-3">Consent to receive marketing text messages is not required as a condition of purchasing any goods or services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Message Frequency</h2>
            <p>Message frequency varies by merchant and depends on campaigns configured by the merchant. Customers may receive messages for promotions, win-back campaigns, birthday offers, and other marketing communications. Merchants using ShopWires are encouraged to message responsibly and not excessively.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Message and Data Rates</h2>
            <p>Message and data rates may apply. Customers are responsible for any charges their mobile carrier applies to text messages received. Check your mobile plan for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Opt Out</h2>
            <p>Customers may opt out of receiving SMS messages at any time by replying <strong>STOP</strong> to any message received from the merchant. After opting out, the customer will receive a single confirmation message and no further messages will be sent.</p>
            <p className="mt-3">Customers may also opt back in at any time by texting the merchant's keyword again.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Help</h2>
            <p>Customers may reply <strong>HELP</strong> at any time to receive assistance and contact information for the merchant. For questions about ShopWires as a platform, contact us at <a href="mailto:keith.lowery@scenicautotech.com" className="text-brand-600 hover:underline">keith.lowery@scenicautotech.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Supported Carriers</h2>
            <p>ShopWires uses Twilio to deliver SMS messages. Supported carriers include but are not limited to: AT&T, T-Mobile, Verizon, Sprint, Boost Mobile, MetroPCS, U.S. Cellular, and most major US mobile carriers. Carrier support is not guaranteed for all carriers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Privacy</h2>
            <p>Customer phone numbers and opt-in data are stored securely and used only to send messages from the specific merchant the customer opted in to. We do not sell customer phone numbers to third parties. For more information, see our <a href="/legal/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">For Merchants — Your Responsibilities</h2>
            <p>As a ShopWires merchant, you are responsible for:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Displaying your opt-in keyword and SMS number clearly to customers at your point of sale</li>
              <li>Ensuring customers understand they are opting into SMS marketing messages</li>
              <li>Including this SMS Messaging Terms URL or equivalent disclosures in any promotional materials for your keyword</li>
              <li>Complying with TCPA, CAN-SPAM, and all applicable federal and state laws governing commercial SMS messaging</li>
              <li>Not sending unsolicited, deceptive, or illegal content</li>
              <li>Honoring all STOP requests immediately — ShopWires handles this automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Recommended Opt-In Disclosure</h2>
            <p>When promoting your keyword, include a disclosure like the following on signage, receipts, or marketing materials:</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
              <p className="text-sm text-slate-700 font-mono leading-relaxed">
                Text [KEYWORD] to [YOUR NUMBER] to join our VIP loyalty list and receive exclusive deals and offers. By texting in, you agree to receive recurring automated marketing text messages. Msg & data rates may apply. Reply STOP to unsubscribe, HELP for help. See shopwires.com/legal/sms for full terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
            <p>For questions about these SMS Messaging Terms:<br />
            <strong>ShopWires</strong><br />
            Soddy Daisy, Tennessee<br />
            <a href="mailto:keith.lowery@scenicautotech.com" className="text-brand-600 hover:underline">keith.lowery@scenicautotech.com</a></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-6">
          <a href="/legal/terms" className="hover:text-slate-600">Terms of Service</a>
          <a href="/legal/privacy" className="hover:text-slate-600">Privacy Policy</a>
          <a href="/" className="hover:text-slate-600">Home</a>
        </div>
      </footer>
    </div>
  );
}

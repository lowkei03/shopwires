import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="ShopWires" className="w-8 h-8" />
            <span className="text-xl font-bold text-brand-600 tracking-tight">ShopWires</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
            <Link href="/auth/signup" className="btn-primary">Start free trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          📱 No app download required for your customers
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Bring your customers<br className="hidden md:block" /> back through the door
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          ShopWires helps local shops keep the customers they already have.
          Customers text a keyword, you get them back automatically — no loyalty cards, no complicated setup.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 w-full sm:w-auto justify-center">
            Try it free for 30 days
          </Link>
          <p className="text-sm text-slate-400">No credit card needed to start</p>
        </div>

        {/* Hero visual */}
        <div className="mt-16 bg-slate-50 rounded-2xl border border-slate-200 p-8 max-w-2xl mx-auto">
          <div className="flex flex-col gap-3 text-left">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">How it works in your shop</div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div className="bg-white rounded-xl px-4 py-3 border border-slate-200 flex-1">
                <p className="text-sm text-slate-700">Customer sees your sign: <span className="font-semibold">"Text BREWS to join our VIP list"</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div className="bg-white rounded-xl px-4 py-3 border border-slate-200 flex-1">
                <p className="text-sm text-slate-700">They text it from their phone — <span className="font-semibold">instantly added to your list</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div className="bg-brand-50 rounded-xl px-4 py-3 border border-brand-200 flex-1">
                <p className="text-sm text-brand-800 font-medium">📱 "Hey! It's been a while — come back this week and get 10% off. Reply STOP to opt out."</p>
                <p className="text-xs text-brand-600 mt-1">ShopWires sends this automatically when they haven't visited in 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-600 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { stat: "98%", label: "SMS open rate vs 20% for email" },
            { stat: "3 min", label: "Average setup time" },
            { stat: "0", label: "App downloads required for customers" },
          ].map((s) => (
            <div key={s.stat}>
              <p className="text-4xl font-bold text-white mb-1">{s.stat}</p>
              <p className="text-brand-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need, nothing you don't</h2>
          <p className="text-slate-500">Built for shop owners who are busy running their business, not learning software.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "📱", title: "SMS opt-in keyword", desc: "Pick a word like BREWS or CUTS. Customers text it to join. That's it." },
            { icon: "🔄", title: "Win-back automation", desc: "We text customers automatically when they haven't visited in a while — you set how long." },
            { icon: "🎂", title: "Birthday campaigns", desc: "Automatically send a special offer on each customer's birthday. They feel remembered." },
            { icon: "📣", title: "Broadcast messages", desc: "Send a message to your whole list at once — flash sales, new arrivals, slow day deals." },
            { icon: "👥", title: "Customer list", desc: "See every customer, their visit count, birthday, and notes — all in one place." },
            { icon: "📊", title: "Message history", desc: "See every message sent and received. Know exactly what's going out and when." },
          ].map((f) => (
            <div key={f.title} className="card hover:border-slate-300 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — detail */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Set it up in under 5 minutes</h2>
            <p className="text-slate-500">No tech skills needed. If you can send a text, you can use ShopWires.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { step: "1", title: "Create your account", desc: "Sign up with your email. No credit card needed for the first 30 days." },
              { step: "2", title: "Pick your keyword", desc: "Choose a word that fits your shop — like TACOS, BLOOMS, or CUTS. Must be one word." },
              { step: "3", title: "Connect Twilio for SMS", desc: "ShopWires sends texts through your own Twilio account — you control the costs and own the number." },
              { step: "4", title: "Start sharing your keyword", desc: "Put it on a sign, your receipts, your counter — anywhere customers will see it." },
            ].map((s) => (
              <div key={s.step} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white text-lg font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Simple, honest pricing</h2>
            <p className="text-slate-500">No contracts, no setup fees, no surprises. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter", price: 29,
                desc: "Great for shops just getting started with SMS loyalty.",
                features: ["500 customers", "1 active campaign", "SMS opt-in keyword", "Customer dashboard", "30-day free trial"],
              },
              {
                name: "Growth", price: 59, popular: true,
                desc: "For shops ready to automate and grow their loyal customer base.",
                features: ["2,500 customers", "Unlimited campaigns", "Win-back automation", "Birthday campaigns", "Analytics", "30-day free trial"],
              },
              {
                name: "Pro", price: 99,
                desc: "For high-volume shops that want full control.",
                features: ["Unlimited customers", "Everything in Growth", "White-label branding", "API access", "Priority support", "30-day free trial"],
              },
            ].map((plan) => (
              <div key={plan.name} className={`card relative flex flex-col ${plan.popular ? "border-brand-400 ring-2 ring-brand-100" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <h3 className="font-bold text-slate-900 mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  ${plan.price}<span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-brand-500 font-bold shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className={`justify-center ${plan.popular ? "btn-primary" : "btn-secondary"}`}>
                  Get started free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Questions we hear a lot</h2>
          <div className="space-y-6">
            {[
              {
                q: "Do my customers need to download an app?",
                a: "Nope. They just text your keyword from their regular phone. No app, no account, no friction. If they can send a text, they can join your list.",
              },
              {
                q: "What is Twilio and why do I need it?",
                a: "Twilio is the service that actually sends and receives the text messages. ShopWires uses your own Twilio account so you own your phone number and control your costs. Twilio has a free trial and plans start at around $15/month depending on how many messages you send.",
              },
              {
                q: "Is this legal? Can I just text my customers?",
                a: "Yes — because customers opt in by texting your keyword first, you have their express consent. Every message ShopWires sends automatically includes opt-out instructions. We follow TCPA guidelines.",
              },
              {
                q: "What happens if someone texts STOP?",
                a: "They're immediately removed from your list and won't receive any more messages. This is handled automatically — you don't need to do anything.",
              },
              {
                q: "Can I import my existing customer list?",
                a: "Yes. Upload a CSV file with phone numbers and ShopWires will import them. You can also add customers one at a time or collect them through your keyword.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. No contracts, no cancellation fees. You can cancel from your billing page and your subscription will continue until the end of the paid period.",
              },
            ].map((faq) => (
              <div key={faq.q} className="card">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to bring customers back?</h2>
          <p className="text-brand-200 mb-8 leading-relaxed">
            Join shop owners who are using ShopWires to turn one-time buyers into regulars.
            Set up takes less than 5 minutes.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-brand-600 text-base font-semibold hover:bg-brand-50 transition-colors">
            Start your free 30-day trial
          </Link>
          <p className="text-brand-300 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-brand-600">ShopWires</span>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} ShopWires. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/terms" className="text-sm text-slate-400 hover:text-slate-600">Terms</Link>
            <Link href="/legal/privacy" className="text-sm text-slate-400 hover:text-slate-600">Privacy</Link>
            <Link href="/legal/sms" className="text-sm text-slate-400 hover:text-slate-600">SMS Terms</Link>
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-slate-600">Log in</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

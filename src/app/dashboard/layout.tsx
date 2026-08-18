import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: merchant } = await supabase
    .from("merchants").select("shop_name, onboarding_complete").eq("user_id", user.id).single();

  if (!merchant?.onboarding_complete) redirect("/onboarding");

  const nav = [
    { href: "/dashboard",             label: "Overview",   icon: "🏠" },
    { href: "/dashboard/customers",   label: "Customers",  icon: "👥" },
    { href: "/dashboard/campaigns",   label: "Campaigns",  icon: "📣" },
    { href: "/dashboard/analytics",   label: "Analytics",  icon: "📊" },
    { href: "/dashboard/messages",    label: "Messages",   icon: "💬" },
    { href: "/dashboard/settings",    label: "Settings",   icon: "⚙️" },
    { href: "/dashboard/billing",     label: "Billing",    icon: "💳" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col py-6 px-3 shrink-0">
        <div className="px-3 mb-8">
          <div className="flex items-center gap-2 mb-0.5">
            <img src="/logo.svg" alt="ShopWires" className="w-6 h-6" />
            <span className="text-lg font-bold text-brand-600">ShopWires</span>
          </div>
          <p className="text-xs text-slate-400 truncate pl-8">{merchant?.shop_name}</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

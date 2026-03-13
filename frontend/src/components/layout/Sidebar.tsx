"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Map, 
  Wind, 
  Bus, 
  Zap,
  Settings, 
  HelpCircle,
  LayoutDashboard
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Map className="w-6 h-6" />
          UrbanNexus
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem 
          href="/" 
          icon={<LayoutDashboard />} 
          label="Dashboard" 
          active={pathname === "/"} 
        />
        <SidebarItem 
          href="/traffic" 
          icon={<BarChart3 />} 
          label="Traffic Analysis" 
          active={pathname === "/traffic"} 
        />
        <SidebarItem 
          href="/air-quality" 
          icon={<Wind />} 
          label="Air Quality" 
          active={pathname === "/air-quality"} 
        />
        <SidebarItem 
          href="/transport" 
          icon={<Bus />} 
          label="Public Transport" 
          active={pathname === "/transport"} 
        />
        <SidebarItem 
          href="/energy" 
          icon={<Zap />} 
          label="Energy Consumption" 
          active={pathname === "/energy"} 
        />
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <SidebarItem href="/settings" icon={<Settings />} label="Settings" />
        <SidebarItem href="/support" icon={<HelpCircle />} label="Help & Support" />
      </div>
    </aside>
  );
}

function SidebarItem({ 
  href,
  icon, 
  label, 
  active = false 
}: { 
  href: string;
  icon: React.ReactNode; 
  label: string; 
  active?: boolean 
}) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
      active 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}>
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

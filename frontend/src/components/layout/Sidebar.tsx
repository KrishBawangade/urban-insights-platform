import Link from "next/link";
import { 
  BarChart3, 
  Map, 
  Wind, 
  Bus, 
  Settings, 
  HelpCircle,
  LayoutDashboard
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Map className="w-6 h-6" />
          Urban Insights
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
        <SidebarItem icon={<BarChart3 />} label="Traffic Analysis" />
        <SidebarItem icon={<Wind />} label="Air Quality" />
        <SidebarItem icon={<Bus />} label="Public Transport" />
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <SidebarItem icon={<Settings />} label="Settings" />
        <SidebarItem icon={<HelpCircle />} label="Help & Support" />
      </div>
    </aside>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean 
}) {
  return (
    <Link href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
      active 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`}>
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

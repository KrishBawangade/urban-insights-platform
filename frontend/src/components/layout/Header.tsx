import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-background border border-border rounded-md px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="Search insights..." 
          className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:bg-background rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert rounded-full border-2 border-card"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground mt-1">Hackathon Team</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

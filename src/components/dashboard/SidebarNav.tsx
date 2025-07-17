import React from 'react';
import { Button } from "@/components/ui/button";
import {
  TrendingUp, User, ShoppingBag, Calendar, CreditCard, FileText, Store, MessageSquare, Users,
  BookOpen, Target, Newspaper, MessageCircle, Bot, Briefcase, Shield, Settings, LogOut, Package, Trophy, UserCog, IdCard
} from "lucide-react";

const dashboardSections = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "id-card", label: "Digital ID Card", icon: IdCard },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "services", label: "Services", icon: ShoppingBag },
    { id: "events", label: "Events & Clubs", icon: Calendar },
    { id: "club-admin", label: "Club Admin", icon: UserCog },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "store", label: "Campus Store", icon: Store },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "mentor", label: "Mentor", icon: Users },
];

const advancedFeatures = [
    { id: "progress", label: "Academic Progress", icon: TrendingUp },
    { id: "notes", label: "Notes & Planner", icon: BookOpen },
    { id: "gamification", label: "Achievements", icon: Target },
    { id: "news", label: "Campus News", icon: Newspaper },
    { id: "connect", label: "Peer Connect", icon: MessageCircle },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "career", label: "Career Hub", icon: Briefcase },
    { id: "vault", label: "Document Vault", icon: Shield },
];

interface SidebarNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleSignOut: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeSection, setActiveSection, handleSignOut }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pb-4">
        {/* Core Features */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3 px-2 sm:px-4">
            Core Features
          </h3>
          <div className="space-y-1">
            {dashboardSections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{section.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Advanced Features */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3 px-2 sm:px-4">
            Advanced Features
          </h3>
          <div className="space-y-1">
            {advancedFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Button
                  key={feature.id}
                  variant={activeSection === feature.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
                  onClick={() => setActiveSection(feature.id)}
                >
                  <Icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{feature.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings - Fixed at bottom */}
      <div className="flex-shrink-0 pt-4 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4">
            <Settings className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

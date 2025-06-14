
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  TrendingUp, User, ShoppingBag, Calendar, CreditCard, FileText, Store, MessageSquare, Users,
  BookOpen, Target, Newspaper, MessageCircle, Bot, Briefcase, Shield, Settings, LogOut
} from "lucide-react";

const dashboardSections = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "services", label: "Services", icon: ShoppingBag },
    { id: "events", label: "Events & Clubs", icon: Calendar },
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
    <div className="space-y-6">
      {/* Core Features */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-4">
          Core Features
        </h3>
        <div className="space-y-1">
          {dashboardSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Advanced Features */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-4">
          Advanced Features
        </h3>
        <div className="space-y-1">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Button
                key={feature.id}
                variant={activeSection === feature.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(feature.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {feature.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="pt-6 border-t border-border">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

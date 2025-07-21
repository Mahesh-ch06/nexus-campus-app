import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  X, 
  MessageCircle, 
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Lightbulb,
  Heart,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Coffee,
  Zap,
  Crown,
  Rocket,
  Target,
  Code,
  Github,
  Linkedin,
  Trophy,
  TrendingUp
} from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePoints } from "@/hooks/usePoints";

import { supabase } from "@/integrations/supabase/client";


// Define the valid message types
type MessageType = 'text' | 'link' | 'feature' | 'info' | 'founder' | 'leaderboard';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
  type?: MessageType;
  hasLinks?: boolean;
}

interface ChatBotProps {
  userProfile?: {
    full_name?: string;
    profile_picture_url?: string;
    hall_ticket?: string;
    email?: string;
    year?: string;
    branch?: string;
    engagement?: {
      activity_points?: number;
    };
  };
}


const ChatBot = ({ userProfile }: ChatBotProps) => {
  // For menu and budget suggestions
  const [todayMenu, setTodayMenu] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  useEffect(() => {
    setMenuLoading(true);
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        setTodayMenu(data || []);
        setMenuLoading(false);
      }, () => setMenuLoading(false));
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use your existing hooks for proper data integration
  const { profile } = useUserProfile();
  const { leaderboard, currentUserData, currentUserRank, isLoading: leaderboardLoading } = useLeaderboard();
  const { currentPoints, pointsHistory } = usePoints();

  // Updated Google AI API configuration
  const GEMINI_API_KEY = "AIzaSyAO_fCKzr09fzTNsQQimVsHTovKIVZ0uIU";
  const GEMINI_AI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  // Check if user is on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user's first name for personalization
  const getUserFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0];
    }
    return 'Student';
  };

  // Enhanced message formatter for better text rendering
  const formatMessageContent = (content: string, messageType?: MessageType) => {
    // Split content into lines
    const lines = content.split('\n');
    
    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          // Handle different line types
          if (line.trim() === '') return <div key={index} className="h-1" />;
          
          // Handle headers (lines starting with 🚀, 🎯, 👨‍💻, etc.)
          if (line.includes('**') && (line.includes('🚀') || line.includes('🎯') || line.includes('👨‍💻') || line.includes('🌟') || line.includes('🤖') || line.includes('💡') || line.includes('📞') || line.includes('📋') || line.includes('🏆'))) {
            const cleanLine = line.replace(/\*\*/g, '');
            return (
              <div key={index} className={`font-bold ${isMobile ? 'text-sm' : 'text-base'} text-primary mb-2 flex items-center gap-1`}>
                {cleanLine}
              </div>
            );
          }
          
          // Handle sub-headers (lines with **text**)
          if (line.includes('**') && line.includes(':')) {
            const cleanLine = line.replace(/\*\*/g, '');
            return (
              <div key={index} className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} text-foreground/90 mt-2 mb-1`}>
                {cleanLine}
              </div>
            );
          }
          
          // Handle LinkedIn profile links
          if (line.includes('linkedin.com')) {
            return (
              <div key={index} className={`flex items-center gap-2 my-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <Linkedin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600 flex-shrink-0`} />
                <a 
                  href={line.trim()}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1 hover:underline break-all`}
                >
                  Connect with Mahesh on LinkedIn
                  <ExternalLink className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} flex-shrink-0`} />
                </a>
              </div>
            );
          }
          
          // Handle bullet points
          if (line.trim().startsWith('•')) {
            return (
              <div key={index} className={`flex items-start gap-2 ${isMobile ? 'ml-1' : 'ml-2'}`}>
                <div className={`${isMobile ? 'w-1 h-1 mt-1.5' : 'w-1.5 h-1.5 mt-2'} rounded-full bg-primary flex-shrink-0`}></div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground/80 leading-relaxed`}>{line.replace('•', '').trim()}</span>
              </div>
            );
          }
          
          // Handle numbered lists
          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={index} className={`flex items-start gap-2 ${isMobile ? 'ml-1' : 'ml-2'}`}>
                <span className={`text-primary font-medium ${isMobile ? 'text-xs mt-0' : 'text-sm mt-0.5'}`}>{line.match(/^\d+\./)?.[0]}</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground/80 leading-relaxed`}>{line.replace(/^\d+\./, '').trim()}</span>
              </div>
            );
          }
          
          // Handle italic text (text between *)
          if (line.includes('*') && !line.includes('**')) {
            const parts = line.split('*');
            return (
              <div key={index} className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground italic leading-relaxed`}>
                {parts.map((part, partIndex) => (
                  partIndex % 2 === 1 ? <em key={partIndex}>{part}</em> : <span key={partIndex}>{part}</span>
                ))}
              </div>
            );
          }
          
          // Regular text
          return (
            <div key={index} className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground/80 leading-relaxed`}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  // Initialize messages with personalized greeting
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        id: '1',
        content: `Hi ${getUserFirstName()}! 👋 

Welcome to CampusConnect! I'm your personal AI assistant powered by Google Gemini, and I'm here to make your campus life easier.

🚀 I can help you with:
• 🍕 Food ordering from campus stores
• 🎉 Events and club information
• 📚 Academic support and deadlines
• 🪪 Digital ID card and profile management
• 💳 Payments and fee transactions
• 📄 Forms and document submissions
• 🏆 Leaderboard rankings and activity points
• 🎓 Mentor connections and guidance
• 🤖 Advanced AI-powered conversations
• ℹ️ Information about CampusConnect

${profile?.hall_ticket ? `I see you're ${profile.hall_ticket}` : ''} - What would you like to explore today?

💡 Tip: Ask me about the founder, features, your rank, or anything else!`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered',
        type: 'info'
      }
    ]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Delay focus on mobile to prevent keyboard issues
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, isMobile ? 300 : 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, isMobile]);

  // Enhanced Google AI Integration with updated endpoint
  const getGoogleAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const userPoints = currentPoints || profile?.engagement?.activity_points || 0;
      const userRankDisplay = currentUserRank ? `#${currentUserRank}` : 'Not ranked yet';
      const totalUsers = leaderboard?.length || 10;

      const systemPrompt = `You are CampusConnect AI, a helpful campus assistant created by Mahesh Chitikeshi. You help students with campus life, food ordering, events, academics, and more. 

Context about the user:
- Name: ${profile?.full_name || getUserFirstName()}
- Hall Ticket: ${profile?.hall_ticket || 'Unknown'}
- Email: ${profile?.email || 'Unknown'}
- Department: ${profile?.department || 'Unknown'}
- Activity Points: ${userPoints}
- Current Leaderboard Rank: ${userRankDisplay} (out of ${totalUsers}+ students)
- Recent Transactions: ${pointsHistory?.length || 0} recorded activities

Instructions:
- Keep responses helpful, friendly, and concise (max 300 words)
- Always maintain a positive tone and use emojis appropriately
- If asked about the founder, mention Mahesh Chitikeshi and his LinkedIn: https://www.linkedin.com/in/mahesh-chitikeshi-b7a0982b9/
- If asked about leaderboard rank, use the provided rank information
- For campus-specific questions, provide helpful guidance
- Use the user's name (${getUserFirstName()}) in responses
- Be encouraging and supportive`;

      const response = await fetch(GEMINI_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Question: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to my AI brain right now. Let me use my local knowledge to help you!";
    } catch (error) {
      console.error('Google AI API Error:', error);
      throw error;

    }
  };

  // Helper: Suggest a meal plan within a budget

  const getMealPlanForBudget = (budget: number) => {
    if (!todayMenu || todayMenu.length === 0) return null;
    // Sort by price ascending, try to fill budget
    let plan: any[] = [];
    let total = 0;
    for (const item of [...todayMenu].sort((a, b) => a.price - b.price)) {
      if (total + item.price <= budget) {
        plan.push(item);
        total += item.price;
      }
    }
    return { plan, total };
  };

  const getBotResponse = async (userMessage: string): Promise<{ content: string; type: MessageType; hasLinks: boolean }> => {
    const message = userMessage.toLowerCase();
    const firstName = getUserFirstName();

    // Advanced: Today's menu
    if (/(today('|’)s|today s|menu|what.*available|show.*menu|food list|lunch menu|dinner menu)/i.test(message)) {
      if (menuLoading) {
        return { content: "Fetching today's menu, please wait...", type: 'info', hasLinks: false };
      }
      if (!todayMenu || todayMenu.length === 0) {
        return { content: "Sorry, today's menu is not available right now.", type: 'info', hasLinks: false };
      }
      const menuList = todayMenu.map((item: any) => `• ${item.name} - ₹${item.price}${item.quantity <= 0 ? ' (Out of stock)' : ''}`).join('\n');
      return {
        content: `🍽️ **Today's Menu:**\n\n${menuList}\n\n*You can order from the Campus Store!*`,
        type: 'info',
        hasLinks: false
      };
    }

    // Advanced: Budget-based meal suggestion
    const budgetMatch = message.match(/(?:budget|under|for|with)\s*₹?([0-9]{2,5})/i);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1], 10);
      if (menuLoading) {
        return { content: 'Let me check the menu for your budget...', type: 'info', hasLinks: false };
      }
      const result = getMealPlanForBudget(budget);
      if (!result || result.plan.length === 0) {
        return { content: `Sorry, I couldn't find a meal plan under ₹${budget}. Try increasing your budget or check back later!`, type: 'info', hasLinks: false };
      }
      const planList = result.plan.map((item: any) => `• ${item.name} - ₹${item.price}`).join('\n');
      return {
        content: `🥗 **Meal Plan for ₹${budget}:**\n\n${planList}\n\n**Total:** ₹${result.total}\n\n*Tip: Add these to your cart from the Campus Store!*`,
        type: 'info',
        hasLinks: false
      };
    }

    // Founder
    if (message.includes('founder') || message.includes('creator') || message.includes('mahesh') || message.includes('who made') || message.includes('who created')) {
      return {
        content: `🚀 **About CampusConnect's Founder**\n\nCampusConnect was created by Mahesh Chitikeshi, a passionate developer dedicated to improving campus life for students!\n\n👨‍💻 **About Mahesh:**\n• Innovative software developer and tech enthusiast\n• Student-focused solution creator\n• Campus technology pioneer\n• Full-stack development expert\n• Open source contributor\n\n🎯 **His Vision:**\nTo create a unified platform that makes campus life seamless, from food ordering to academic management, bringing all student services under one roof.\n\n🌟 **CampusConnect Impact:**\n• Streamlined campus operations\n• Enhanced student experience\n• Digital transformation of education\n• Community building through technology\n\nConnect with Mahesh on LinkedIn:\nhttps://www.linkedin.com/in/mahesh-chitikeshi-b7a0982b9/\n\nWant to collaborate or learn more? Reach out through his profile! 🔗`,
        type: 'founder',
        hasLinks: true
      };
    }

    // Leaderboard rank queries
    if (message.includes('rank') || message.includes('leaderboard') || message.includes('my rank') || message.includes('position') || message.includes('ranking')) {
      const userPoints = currentPoints || profile?.engagement?.activity_points || 0;
      const userRankDisplay = leaderboardLoading ? 'Loading...' : 
                              currentUserRank ? `#${currentUserRank}` : 
                              currentUserData?.rank ? `#${currentUserData.rank}` : 'Not ranked yet';
      const totalUsers = leaderboard?.length || 10;
      const currentData = currentUserData || leaderboard?.find(u => u.is_current_user);
      let percentile = 0;
      if (currentUserRank && totalUsers > 0) {
        percentile = Math.round(((totalUsers - currentUserRank) / totalUsers) * 100);
      } else if (currentData?.rank && totalUsers > 0) {
        percentile = Math.round(((totalUsers - currentData.rank) / totalUsers) * 100);
      }
      const getStatus = (points: number) => {
        if (points >= 2000) return '👑 Elite Performer';
        if (points >= 1500) return '🌟 Top Performer';
        if (points >= 1000) return '🚀 Rising Star';
        if (points >= 500) return '💪 Active Member';
        if (points >= 100) return '🌱 Getting Started';
        return '🆕 New Member';
      };
      const recentTransactions = pointsHistory?.slice(0, 3) || [];
      const transactionText = recentTransactions.length > 0 
        ? `Recent Activity: ${recentTransactions.map(t => `${t.points > 0 ? '+' : ''}${t.points} pts`).join(', ')}`
        : 'No recent activity';
      return {
        content: `🏆 **Your Leaderboard Status, ${firstName}!**\n\n🎯 **Current Rankings:**\n• Your Position: ${userRankDisplay} out of ${totalUsers.toLocaleString()}+ students\n• Activity Points: ${userPoints.toLocaleString()} points\n• Status: ${getStatus(userPoints)}\n${percentile > 0 ? `• Percentile: Top ${100 - percentile}% (${percentile}th percentile)` : ''}\n\n📊 **Performance Insights:**\n• Total Transactions: ${pointsHistory?.length || 0}\n• ${transactionText}\n• Profile Complete: ${profile?.full_name && profile?.department ? '✅ Yes' : '⏳ Pending'}\n\n📈 **How to Improve Your Rank:**\n• Participate in campus events and activities (+50-100 points)\n• Join clubs and student organizations (+25-75 points)\n• Complete academic milestones (+20-50 points)\n• Use campus services through CampusConnect (+10-30 points)\n• Engage with the community (+15-40 points)\n• Attend workshops and skill programs (+30-80 points)\n\n🎉 **Current Achievements:**\n• ${userPoints >= 100 ? '✅ Active Participant' : '⏳ Starting Journey (need 100 pts)'}\n• ${userPoints >= 500 ? '✅ Community Contributor' : '🎯 Next Goal: 500 points'}\n• ${userPoints >= 1000 ? '✅ Campus Leader' : '🌟 Next Goal: 1000 points'}\n• ${userPoints >= 2000 ? '✅ Elite Status' : '👑 Next Goal: 2000 points'}\n\n💡 **Pro Tip:** Check the ${leaderboard?.length > 0 ? 'Leaderboard page' : 'Profile Activity section'} for detailed rankings and compete with fellow students!\n\nKeep up the great work, ${firstName}! 🌟`,
        type: 'leaderboard',
        hasLinks: false
      };
    }

    // Features
    if (message.includes('features') || message.includes('what can you do') || message.includes('capabilities')) {
      return {
        content: `🌟 **CampusConnect Features & My Capabilities**\n\n🎯 **Platform Features:**\n• 🍕 Campus Food Ordering System with real-time tracking\n• 🎉 Events & Club Management with RSVP functionality\n• 🪪 Digital ID Card System with QR verification\n• 💳 Integrated Payment Gateway for all campus transactions\n• 📄 Digital Forms & Applications with instant processing\n• 🏆 Student Leaderboard & Gamification system\n• 🎓 Mentor-Student Connection Platform\n• 📚 Academic Progress Tracking and analytics\n\n🤖 **My AI Capabilities:**\n• Powered by Google Gemini for natural conversations\n• Natural language understanding and context awareness\n• Personalized responses using your profile data\n• Campus service guidance and navigation help\n• Real-time assistance 24/7\n• Context-aware conversations with memory\n• Multi-topic support with intelligent routing\n\n💡 **Smart Features:**\n• Voice-like typing delays for natural feel\n• Message status indicators and read receipts\n• Intelligent chat history management\n• Minimizable interface for multitasking\n• Fully responsive design for all devices\n• Dark/light theme support\n\nAsk me anything, ${firstName}! I'm here to make your campus life amazing! ✨`,
        type: 'feature',
        hasLinks: false
      };
    }

    // Contact/support
    if (message.includes('contact') || message.includes('support') || message.includes('help desk')) {
      return {
        content: `📞 **CampusConnect Support & Contact**\n\n🆘 **Get Instant Help:**\n• Use this AI chat for immediate assistance (that's me!)\n• Submit feedback through Dashboard → Feedback section\n• Contact mentors for academic guidance and support\n• Use digital forms for official requests and queries\n\n📧 **Developer Contact:**\n• Connect on LinkedIn for professional inquiries\n• Use CampusConnect platform feedback for suggestions\n• Join our community for updates and discussions\n\n🏫 **Campus Support Channels:**\n• Visit your campus IT helpdesk for technical issues\n• Check the Forms section for official communication channels\n• Use the mentor system for peer-to-peer support\n• Access emergency contacts through your digital ID\n\n💬 **Advanced Chat Features:**\n• 24/7 AI assistance powered by Google Gemini\n• Instant responses for common campus queries\n• Smart suggestions and proactive guidance\n• Context-aware help based on your profile\n\nLinkedIn Profile:\nhttps://www.linkedin.com/in/mahesh-chitikeshi-b7a0982b9/\n\nHow else can I help you today, ${firstName}? 🌟`,
        type: 'info',
        hasLinks: true
      };
    }

    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greetings = [
        `Hello ${firstName}! 😊 How can I help you today?`,
        `Hi there, ${firstName}! What can I assist you with?`,
        `Hey ${firstName}! Ready to explore CampusConnect?`,
        `Good to see you, ${firstName}! What would you like to know?`
      ];
      return {
        content: greetings[Math.floor(Math.random() * greetings.length)],
        type: 'text',
        hasLinks: false
      };
    }

    // Personal info
    if (message.includes('my profile') || message.includes('my info') || message.includes('about me')) {
      let profileInfo = `📋 **Your Profile Information, ${firstName}:**\n\n`;
      if (profile?.full_name) profileInfo += `👤 Name: ${profile.full_name}\n`;
      if (profile?.hall_ticket) profileInfo += `🎫 Hall Ticket: ${profile.hall_ticket}\n`;
      if (profile?.email) profileInfo += `📧 Email: ${profile.email}\n`;
      if (profile?.department) profileInfo += `🏛️ Department: ${profile.department}\n`;
      if (profile?.academic_year) profileInfo += `📅 Academic Year: ${profile.academic_year}\n`;
      profileInfo += `\n🏆 Activity Points: ${currentPoints || 0}\n`;
      profileInfo += `📊 Leaderboard Rank: ${currentUserRank ? `#${currentUserRank}` : 'Not ranked yet'}\n`;
      profileInfo += `\n✨ You can update your profile anytime in the Profile section!`;
      return {
        content: profileInfo,
        type: 'info',
        hasLinks: false
      };
    }

    // Food/campus store
    if (message.includes('food') || message.includes('order') || message.includes('campus store') || message.includes('hungry') || message.includes('lunch') || message.includes('dinner')) {
      return {
        content: `🍕 **Food Ordering Made Easy!**\n\nFeeling hungry, ${firstName}?\n\nAsk me for today's menu, or say 'I have a budget of 100, suggest lunch'!\n\n🏪 **Campus Store Features:**\n• Browse available meals, snacks, and beverages\n• Check today's menu and daily offers\n• Real-time order tracking\n• Multiple secure payment options\n• GPS-based delivery\n\n*Try: "What's on the menu today?" or "Suggest a lunch for ₹100"*`,
        type: 'feature',
        hasLinks: false
      };
    }

    // Events and clubs
    if (message.includes('event') || message.includes('club') || message.includes('activity') || message.includes('fun')) {
      return {
        content: `🎉 **Campus Events & Clubs**\n\nGreat question, ${firstName}! Campus life is about to get exciting!\n\n🌟 **Available Features:**\n• Discover upcoming events with detailed information\n• Join clubs that match your interests and hobbies\n• Create and organize your own events\n• Meet like-minded students and build connections\n• Earn activity points for participation\n• Get personalized event recommendations\n\n🎯 **How to Get Started:**\n1. Visit Dashboard → Events & Clubs\n2. Browse upcoming events by category\n3. Join clubs you're interested in\n4. RSVP for events and track attendance\n5. Create your own activities and invite others!\n6. Build your social network on campus\n\n🏆 **Benefits:**\n• Build your professional and social network\n• Develop new skills and hobbies\n• Earn leaderboard points and achievements\n• Have fun and create lasting memories\n• Leadership opportunities in clubs\n• Certificate of participation for events\n\nWhat kind of events interest you most? 🌈`,
        type: 'feature',
        hasLinks: false
      };
    }

    // Gratitude
    if (message.includes('thank') || message.includes('thanks') || message.includes('appreciate')) {
      const thankResponses = [
        `You're absolutely welcome, ${firstName}! 😊 I'm always here to help!`,
        `My pleasure, ${firstName}! That's what I'm here for! 🌟`,
        `Anytime, ${firstName}! Happy to make your campus life easier! 💙`,
        `Glad I could help, ${firstName}! Feel free to ask anything else! ✨`
      ];
      return {
        content: thankResponses[Math.floor(Math.random() * thankResponses.length)],
        type: 'text',
        hasLinks: false
      };
    }

    // Goodbye
    if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
      const goodbyeResponses = [
        `Goodbye, ${firstName}! Have an amazing day on campus! 🌟`,
        `See you later, ${firstName}! Don't hesitate to reach out if you need anything! 👋`,
        `Take care, ${firstName}! Wishing you a productive day ahead! 💙`,
        `Bye ${firstName}! Remember, I'm always here when you need me! ✨`
      ];
      return {
        content: goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)],
        type: 'text',
        hasLinks: false
      };
    }

    // Fallback: Google Gemini AI
    setIsUsingAI(true);
    try {
      const aiResponse = await getGoogleAIResponse(userMessage);
      setIsUsingAI(false);
      return {
        content: `🤖 **AI-Powered Response:**\n\n${aiResponse}\n\n*Powered by Google Gemini*`,
        type: 'info',
        hasLinks: false
      };
    } catch (error) {
      setIsUsingAI(false);
      console.error('AI Response Error:', error);
      const defaultResponses = [
        `I'm having trouble connecting to my AI brain right now, ${firstName}! 😅 Could you try asking again, or be more specific about what you'd like to know?`,
        `Oops! My AI connection is a bit slow, ${firstName}. Could you rephrase your question or try asking about campus services?`,
        `Sorry ${firstName}, I'm experiencing some technical difficulties with my advanced AI features. Please try again in a moment!`
      ];
      return {
        content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)] + 
               "\n\n🌟 **Quick Suggestions:**\n• Ask about the founder\n• Check your leaderboard rank\n• Explore platform features\n• Get help with campus services",
        type: 'text',
        hasLinks: false
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get response (which may include AI call)
      const response = await getBotResponse(currentInput);
      
      // Simulate realistic typing delay (shorter on mobile)
      const baseDelay = isMobile ? 1000 : 1500;
      const typingDelay = Math.min(isMobile ? 2000 : 3000, Math.max(baseDelay, response.content.length * (isMobile ? 10 : 15)));

      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: 'bot',
          timestamp: new Date(),
          status: 'delivered',
          type: response.type,
          hasLinks: response.hasLinks
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        setIsUsingAI(false);
      }, typingDelay);
    } catch (error) {
      console.error('Error getting response:', error);
      setIsTyping(false);
      setIsUsingAI(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: `Chat cleared! Welcome back, ${getUserFirstName()}! 👋 

🤖 I'm powered by Google Gemini and ready to help with all your campus needs!

**Quick Commands:**
• "features" - See what I can do
• "founder" - Learn about CampusConnect's creator
• "my rank" - Check your leaderboard position
• "contact" - Get support information
• Or just ask me anything naturally!

How can I assist you today? ✨`,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered',
      type: 'info'
    }]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mobile-optimized chat button
  if (!isOpen) {
    return (
      <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative active:scale-95 touch-none`}
          size="icon"
        >
          <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white transition-transform group-hover:scale-110`} />
          <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 rounded-full border-2 border-white flex items-center justify-center`}>
            <Sparkles className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} text-white`} />
          </div>
          <span className="sr-only">Open AI Chat</span>
        </Button>
      </div>
    );
  }

  // Fixed layout with proper height constraints (60-70% of viewport)
  return (
    <Card className={`fixed z-50 transition-all duration-300 ${
      isMobile 
        ? isMinimized 
          ? 'bottom-4 right-4 left-4 h-14'
          : 'bottom-0 right-0 left-0 top-0 h-full w-full rounded-none'
        : isMinimized
          ? 'bottom-6 right-6 w-96 h-16'
          : 'bottom-6 right-6 w-96 h-[70vh] max-h-[600px] min-h-[400px]'
    } bg-card/98 backdrop-blur-xl border shadow-2xl flex flex-col`}>
      
      {/* Header - Fixed */}
      <CardHeader className={`flex-shrink-0 ${isMobile && !isMinimized ? 'pb-3' : 'pb-3'} border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white ${isMobile && !isMinimized ? 'rounded-none' : 'rounded-t-lg'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-white/20 flex items-center justify-center relative`}>
              <Bot className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {isUsingAI && <Zap className={`absolute -top-1 -right-1 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-yellow-300 animate-pulse`} />}
            </div>
            <div>
              <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold flex items-center gap-2`}>
                CampusConnect AI
                <Badge variant="secondary" className={`${isMobile ? 'text-xs px-1.5 py-0' : 'text-xs px-2 py-0.5'} bg-white/20 text-white border-0`}>
                  Gemini
                </Badge>
              </CardTitle>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/80`}>
                {isUsingAI ? 'Thinking with AI...' : profile?.full_name ? `Helping ${getUserFirstName()}` : 'Always here to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 active:scale-95"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} text-white hover:bg-white/20 active:scale-95`}
              onClick={clearChat}
              title="Clear Chat"
            >
              <RotateCcw className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} text-white hover:bg-white/20 active:scale-95`}
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <X className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages Area - Scrollable with fixed height */}
          <ScrollArea className={`flex-1 ${isMobile ? 'p-4' : 'p-4'} overflow-hidden`}>
            <div className={`space-y-4 pb-4`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} flex-shrink-0`}>
                      {message.sender === 'bot' ? (
                        <AvatarFallback className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} ${
                          message.type === 'founder' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          message.type === 'feature' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                          message.type === 'leaderboard' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          message.type === 'info' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-blue-500'
                        }`}>
                          {message.type === 'founder' ? <Crown className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} /> :
                           message.type === 'feature' ? <Rocket className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} /> :
                           message.type === 'leaderboard' ? <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} /> :
                           message.type === 'info' ? <Lightbulb className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} /> : <Bot className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />}
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={profile?.profile_picture_url || userProfile?.profile_picture_url} />
                          <AvatarFallback className={`bg-purple-500 text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {getUserFirstName().charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`rounded-2xl ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.type === 'founder' 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800'
                          : message.type === 'feature'
                            ? 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border border-green-200 dark:border-green-800'
                            : message.type === 'leaderboard'
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border border-yellow-200 dark:border-yellow-800'
                              : message.type === 'info' 
                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800'
                                : 'bg-muted border'
                    }`}>
                      <div className={`${isMobile ? 'text-sm' : 'text-sm'}`}>
                        {message.sender === 'bot' ? formatMessageContent(message.content, message.type) : (
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        )}
                      </div>
                      <div className={`flex items-center justify-end space-x-1 mt-2 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && message.status === 'sent' && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {message.sender === 'bot' && message.type === 'founder' && (
                          <Crown className="h-3 w-3 text-purple-500" />
                        )}
                        {message.sender === 'bot' && message.type === 'feature' && (
                          <Rocket className="h-3 w-3 text-green-500" />
                        )}
                        {message.sender === 'bot' && message.type === 'leaderboard' && (
                          <Trophy className="h-3 w-3 text-yellow-500" />
                        )}
                        {message.sender === 'bot' && message.type === 'info' && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`flex items-start space-x-3 max-w-[80%]`}>
                    <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} flex-shrink-0`}>
                      <AvatarFallback className={`bg-blue-500 text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <Bot className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                      </AvatarFallback>
                    </Avatar>
                    <div className={`bg-muted border rounded-2xl ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        {isUsingAI && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            <Sparkles className="h-2 w-2 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area - Fixed at bottom */}
          <CardContent className={`flex-shrink-0 ${isMobile ? 'p-4' : 'p-4'} border-t bg-background/50`}>
            <div className="flex space-x-3 mb-3">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything, ${getUserFirstName()}...`}
                className={`flex-1 rounded-full ${isMobile ? 'text-sm h-11' : 'h-11'} bg-background`}
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 ${isMobile ? 'h-11 w-11' : 'h-11 w-11'}`}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Google Gemini
              </Badge>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default ChatBot;

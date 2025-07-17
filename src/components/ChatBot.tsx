import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  CheckCircle2
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
}

interface ChatBotProps {
  userProfile?: {
    full_name?: string;
    profile_picture_url?: string;
  };
}

const ChatBot = ({ userProfile }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${userProfile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your CampusConnect AI assistant. I can help you with:

• Campus services and orders
• Event information and club activities
• Academic support and deadlines
• Navigation and campus facilities
• General questions about student life

What would you like to know today?`,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I assist you with your campus needs today? 😊";
    }
    
    if (message.includes('food') || message.includes('order') || message.includes('campus store')) {
      return "🍕 You can order food from the campus cafeteria through the Campus Store section! Just go to Dashboard → Campus Store to browse available options. You can also track your orders in the 'My Orders' section.";
    }
    
    if (message.includes('event') || message.includes('club') || message.includes('activity')) {
      return "🎉 Check out the Events & Clubs section for upcoming activities! You can join clubs, register for events, and even create your own events. Visit Dashboard → Events & Clubs to explore what's happening on campus.";
    }
    
    if (message.includes('profile') || message.includes('account')) {
      return "👤 You can manage your profile in the Profile section. Update your personal info, view your digital ID card, and track your activity points. Go to Dashboard → Profile to get started.";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "🆘 I'm here to help! You can:\n• Use the Feedback section to report issues\n• Contact support through the forms\n• Check the FAQ in various sections\n• Ask me specific questions about campus services";
    }
    
    if (message.includes('leaderboard') || message.includes('points') || message.includes('rank')) {
      return "🏆 Check your ranking on the Leaderboard! Earn activity points by participating in events, completing forms, and engaging with campus services. You're currently doing great!";
    }
    
    if (message.includes('payment') || message.includes('fees')) {
      return "💳 Handle all your payments in the Payments section. You can pay fees, track payment history, and set up payment methods securely.";
    }
    
    if (message.includes('document') || message.includes('form')) {
      return "📄 Access important documents and forms in the Forms section. Submit applications, download certificates, and track your submissions all in one place.";
    }
    
    if (message.includes('mentor') || message.includes('guidance')) {
      return "🎓 Connect with mentors through the Mentor section! Get academic guidance, career advice, and peer support from experienced students and faculty.";
    }
    
    if (message.includes('id card') || message.includes('digital id')) {
      return "🪪 Your digital ID card is available in the Digital ID Card section. It includes your photo, student details, and can be used for campus access and verification.";
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! 😊 I'm always here to help make your campus experience smoother. Is there anything else you'd like to know?";
    }
    
    // Default response
    return "I understand you're asking about campus services. Could you be more specific? I can help with food orders, events, profile management, payments, forms, mentoring, and much more! What specific area would you like help with?";
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
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: `Chat cleared! Hello again ${userProfile?.full_name?.split(' ')[0] || 'there'}! 👋 How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered'
    }]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="sr-only">Open Chat</span>
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-card/98 backdrop-blur-xl border shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[500px]'
    }`}>
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">CampusConnect AI</CardTitle>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={clearChat}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4 h-80">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      {message.sender === 'bot' ? (
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={userProfile?.profile_picture_url} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`rounded-2xl px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-muted border'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && message.status === 'sent' && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted border rounded-2xl px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardContent className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-full"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default ChatBot;

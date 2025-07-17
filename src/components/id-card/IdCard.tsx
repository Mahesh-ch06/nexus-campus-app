
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotateCcw, Download, Share2, QrCode, Cpu, ShieldCheck } from 'lucide-react';
import Logo from "@/components/Logo";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';

interface IdCardProps {
  className?: string;
}

export const IdCard: React.FC<IdCardProps> = ({ className = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  const generateQRCodeUrl = () => {
    const studentData = {
      id: profile?.hall_ticket || 'CS21B0001',
      name: profile?.full_name || 'Student',
      department: profile?.department || 'Computer Science',
      year: profile?.academic_year || '2021-2025',
      points: profile?.engagement?.activity_points || 0
    };
    
    const qrData = encodeURIComponent(JSON.stringify(studentData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&bgcolor=ffffff&color=1f2937&margin=20`;
  };

  const handleDownload = async () => {
    const cardToDownload = isFlipped ? cardBackRef.current : cardFrontRef.current;
    const side = isFlipped ? 'Back' : 'Front';

    if (!cardToDownload) {
      toast({
        title: "Download Error",
        description: "Could not find the card element to download.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await toPng(cardToDownload, { 
        quality: 1, 
        pixelRatio: 3, // For higher resolution
        style: {
          transform: 'scale(1)', // Ensure it's not scaled down
        }
      });
      const link = document.createElement('a');
      link.download = `${profile?.full_name || 'Student'}_CampusConnect_ID_${side}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "✅ Download Complete!",
        description: `The ${side.toLowerCase()} of your ID card has been saved.`,
      });
    } catch (error) {
      console.error('oops, something went wrong!', error);
      toast({
        title: "Download Failed",
        description: "Unable to download your ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const studentData = {
        name: profile?.full_name || 'Student',
        id: profile?.hall_ticket || 'CS21B0001',
        department: profile?.department || 'Computer Science',
        year: profile?.academic_year || '2021-2025',
        points: profile?.engagement?.activity_points || 0
      };
      
      const shareData = {
        title: '🎓 CampusConnect Digital ID',
        text: `Check out ${studentData.name}'s digital student ID!\n\n📚 ${studentData.department}\n🎯 ${studentData.year}\n⭐ ${studentData.points} Activity Points`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "🚀 Shared Successfully!",
          description: "Your digital ID has been shared.",
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
        toast({
          title: "📋 Copied to Clipboard!",
          description: "Your ID details are ready to share.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share your ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto font-sans ${className}`}>
      {/* Card Container */}
      <div className="relative w-full h-52 sm:h-56 perspective-[1200px] mb-6">
        <div 
          className={`
            relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front Side */}
          <div ref={cardFrontRef} className="absolute inset-0 w-full h-full backface-hidden">
            <Card className="w-full h-full bg-slate-900 text-slate-100 border-slate-700 shadow-2xl shadow-cyan-500/10 rounded-2xl overflow-hidden relative bg-grid-slate-400/[0.05]">
              <CardContent className="p-4 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">CampusConnect</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400">Digital Student ID</p>
                  </div>
                  <Logo className="h-8 w-8 text-cyan-400" />
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-slate-600">
                    <AvatarImage src={profile?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-slate-700 text-slate-300">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base sm:text-lg truncate">{profile?.full_name || 'Student Name'}</h2>
                    <p className="text-xs sm:text-sm text-slate-300">{profile?.hall_ticket || 'CS21B0001'}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">{profile?.department || 'Computer Science'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <Cpu className="h-7 w-7 sm:h-8 sm:w-8 text-slate-600" />
                  <div className="text-right">
                    <Badge variant="outline" className="border-cyan-400 text-cyan-400 bg-cyan-400/10 text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                      Valid: {profile?.academic_year || '2021-2025'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-transparent to-slate-900 opacity-50"></div>
            </Card>
          </div>

          {/* Back Side */}
          <div ref={cardBackRef} className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
             <Card className="w-full h-full bg-slate-900 text-slate-100 border-slate-700 shadow-2xl shadow-cyan-500/10 rounded-2xl overflow-hidden relative bg-grid-slate-400/[0.05]">
              <div className="absolute top-4 left-0 w-full h-10 bg-slate-950"></div>
              <CardContent className="p-4 h-full flex flex-col justify-center items-center relative z-10">
                <div className="w-28 h-28 sm:w-32 sm:h-32 p-2 bg-white rounded-lg animate-glow">
                  <img src={generateQRCodeUrl()} alt="QR Code" className="w-full h-full" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-4 text-center">
                  Scan for verification and campus access.
                </p>
                <p className="text-xs text-slate-500 mt-2 absolute bottom-4">
                  This is a secure digital identity card.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          disabled={isFlipping}
          className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300"
        >
          <RotateCcw className={`h-4 w-4 mr-2 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Flip</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300"
        >
          <Download className="h-4 w-4 mr-2" />
          <span>Download</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300"
        >
          <Share2 className="h-4 w-4 mr-2" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};

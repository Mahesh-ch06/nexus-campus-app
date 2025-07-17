
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdCard } from "./IdCard";
import { 
  Shield, 
  Smartphone, 
  Zap, 
  CheckCircle, 
  Star,
  CreditCard,
  QrCode,
  Wifi,
  Lock,
  IdCard as IdCardIcon
} from 'lucide-react';

export const IdCardPage = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Secure Access",
      description: "Encrypted QR codes for secure campus entry and verification"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-green-600" />,
      title: "Digital Wallet",
      description: "Make payments at cafeteria, library, and campus stores"
    },
    {
      icon: <QrCode className="h-6 w-6 text-purple-600" />,
      title: "Smart QR Code",
      description: "Dynamic QR with real-time student data and activity points"
    },
    {
      icon: <Wifi className="h-6 w-6 text-orange-600" />,
      title: "Contactless",
      description: "Touch-free access to all campus facilities and services"
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      title: "Activity Tracking",
      description: "Track your campus engagement and earn rewards"
    },
    {
      icon: <Lock className="h-6 w-6 text-red-600" />,
      title: "Privacy Protected",
      description: "Your data is encrypted and only shared when you choose"
    }
  ];

  const benefits = [
    "🎓 Access to all academic buildings and labs",
    "🍕 Quick payments at campus dining locations",
    "📚 Library book checkouts and renewals",
    "🎪 Event check-ins and registrations",
    "🏃‍♂️ Gym and sports facility access",
    "🅿️ Parking validation and payments",
    "🎯 Activity points for campus engagement",
    "📱 Works offline with cached data"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mr-3">
            <IdCardIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Digital Student ID</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your smart campus identity card with secure QR technology, digital wallet, 
          and instant access to all university services.
        </p>
        <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600">
          ✨ Super Weapon for Students
        </Badge>
      </div>

      {/* Main ID Card Display */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <IdCard />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            What Your Digital ID Can Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Info */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">
                🚀 Your QR Code is Your Super Weapon!
              </h3>
              <p className="text-blue-700 mb-4">
                This isn't just any QR code - it's your gateway to the entire campus ecosystem. 
                Scan once, access everything!
              </p>
              <ul className="space-y-2 text-sm text-blue-600">
                <li>• Real-time data updates with your latest activity points</li>
                <li>• Secure encryption that protects your privacy</li>
                <li>• Works even when you're offline</li>
                <li>• Instant verification for campus staff</li>
              </ul>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <QrCode className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Smartphone className="h-5 w-5 mr-2" />
          Add to Mobile Wallet
        </Button>
        <Button size="lg" variant="outline">
          <Shield className="h-5 w-5 mr-2" />
          Security Settings
        </Button>
      </div>
    </div>
  );
};

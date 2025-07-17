
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";

interface QrCodeDisplayProps {
  value: string;
  studentName: string;
}

export const QrCodeDisplay = ({ value, studentName }: QrCodeDisplayProps) => {
  return (
    <Card className="max-w-md mx-auto soft-shadow animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Your Digital ID</CardTitle>
        <CardDescription>
          Hi {studentName}! Present this QR code at events to earn points.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          {value ? (
            <QRCode value={value} size={200} />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center">
              <p className="text-muted-foreground">Generating QR...</p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          This code is unique to you. Do not share it with others.
          Organizers will scan this to award you points for participation.
        </p>
      </CardContent>
    </Card>
  );
};

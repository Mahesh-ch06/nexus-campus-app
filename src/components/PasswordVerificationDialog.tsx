
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PasswordVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
  getPasswordFormat?: () => string;
  hasProfile?: boolean;
}

export const PasswordVerificationDialog: React.FC<PasswordVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  getPasswordFormat,
  hasProfile = false
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify your password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('user-verification', {
        body: { 
          password,
          userId: user.id 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        // Store verification token securely
        sessionStorage.setItem('user_verification_token', data.verificationToken);
        toast({
          title: "Verification Successful",
          description: "You can now place orders without verification.",
        });
        onVerify(data.verificationToken);
        setPassword('');
        onClose();
      } else {
        setError(data?.error || 'Incorrect password. Please try again.');
        toast({
          title: "Incorrect Password",
          description: "Please enter the correct password using the format shown below.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Verification failed. Please try again.');
      toast({
        title: "Verification Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordFormat = getPasswordFormat ? getPasswordFormat() : '@{yourname}{last4digits}';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            CampusConnect Verification
          </DialogTitle>
          <DialogDescription>
            Enter your personal verification password to place orders on the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-password">Password</Label>
            <Input
              id="verification-password"
              type="password"
              placeholder={`Enter password (${passwordFormat})`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className={error ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              required
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {hasProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Password Format:</p>
                  <p className="text-blue-700">
                    <code className="bg-blue-100 px-1 rounded">{passwordFormat}</code>
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    @ + your first name + last 4 digits of hall ticket (all lowercase)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password.trim() || !hasProfile}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-muted-foreground text-center">
          This verification is required once per session for security purposes.
        </div>
      </DialogContent>
    </Dialog>
  );
};

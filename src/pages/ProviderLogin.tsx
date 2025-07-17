
import { useState, useEffect } from 'react';
import { ProviderLoginHeader } from "@/components/provider/ProviderLoginHeader";
import { ProviderLoginForm } from "@/components/provider/ProviderLoginForm";
import { PartnerPasswordResetForm } from "@/components/provider/PartnerPasswordResetForm";

const ProviderLogin = () => {
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    // Check for password recovery token in URL hash
    if (window.location.hash.includes('type=recovery')) {
      setIsResetMode(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
      <ProviderLoginHeader />
      {isResetMode ? <PartnerPasswordResetForm /> : <ProviderLoginForm />}
    </div>
  );
};

export default ProviderLogin;

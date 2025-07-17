
import { useState } from 'react';
import { PasswordPrompt } from '@/components/staff/PasswordPrompt';
import { PointsPortal } from '@/components/staff/PointsPortal';

const StaffPointsPortal = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            {isAuthenticated ? (
                <PointsPortal />
            ) : (
                <PasswordPrompt onSuccess={handleSuccess} />
            )}
        </div>
    );
};

export default StaffPointsPortal;

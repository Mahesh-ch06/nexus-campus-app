import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { createUserProfile, checkHallTicketExists } from "@/services/userService";
import { toast } from "sonner";
import { User, GraduationCap, Phone, IdCard, Building } from "lucide-react";

interface CreateProfileFormProps {
  onSuccess: () => void;
}

export const CreateProfileForm = ({ onSuccess }: CreateProfileFormProps) => {
  const { user, session } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    hallTicket: "",
    department: "",
    academicYear: "",
    phoneNumber: "",
  });

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical & Electronics Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Biotechnology"
  ];

  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("[CreateProfile] Form submitted", { user: !!user, session: !!session });
    
    if (!user || !session) {
      console.error("[CreateProfile] No user or session available");
      toast.error("Authentication required. Please log in again.");
      return;
    }

    const { fullName, hallTicket, department, academicYear, phoneNumber } = formData;
    if (!fullName || !hallTicket || !department || !academicYear || !phoneNumber) {
      toast.error("Please fill all fields.");
      return;
    }

    if (hallTicket.length !== 10) {
      toast.error("Hall ticket must be exactly 10 characters.");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setIsCreating(true);
    try {
      console.log("[CreateProfile] Checking hall ticket existence...");
      const hallTicketExists = await checkHallTicketExists(hallTicket);
      if (hallTicketExists) {
        toast.error("This Hall Ticket number is already registered.");
        setIsCreating(false);
        return;
      }

      console.log("[CreateProfile] Creating profile...", formData);
      const createdProfile = await createUserProfile(user, formData);
      
      if (createdProfile) {
        console.log("[CreateProfile] Profile created successfully!");
        toast.success("🎉 Welcome to CampusConnect! Your profile has been created successfully!");
        onSuccess();
      } else {
        console.error("[CreateProfile] Profile creation returned null");
        toast.error("Failed to create profile. Please check your information and try again.");
      }
    } catch (error) {
      console.error("[CreateProfile] Profile creation error:", error);
      toast.error("An unexpected error occurred during profile creation. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to CampusConnect! 🎓
              </CardTitle>
              <CardDescription className="text-base sm:text-lg mt-2 text-muted-foreground">
                Complete your profile to unlock all campus services and features
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm sm:text-base font-semibold flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Full Name
                </Label>
                <Input 
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="e.g., John Doe"
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              {/* Hall Ticket */}
              <div className="space-y-2">
                <Label htmlFor="hallTicket" className="text-sm sm:text-base font-semibold flex items-center">
                  <IdCard className="w-4 h-4 mr-2 text-purple-500" />
                  CampusConnect ID (Hall Ticket)
                </Label>
                <Input 
                  id="hallTicket"
                  value={formData.hallTicket}
                  onChange={(e) => handleInputChange("hallTicket", e.target.value.toUpperCase())}
                  placeholder="e.g., 2303A52037"
                  maxLength={10}
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 border-purple-200 focus:border-purple-500 rounded-xl font-mono"
                  required
                />
                <p className="text-xs sm:text-sm text-muted-foreground">This will be your unique CampusConnect ID</p>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm sm:text-base font-semibold flex items-center">
                  <Building className="w-4 h-4 mr-2 text-green-500" />
                  Department
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base border-2 border-green-200 focus:border-green-500 rounded-xl">
                    <SelectValue placeholder="Select Your Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-sm sm:text-base">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year */}
              <div className="space-y-2">
                <Label htmlFor="academicYear" className="text-sm sm:text-base font-semibold flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-orange-500" />
                  Academic Year
                </Label>
                <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                  <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base border-2 border-orange-200 focus:border-orange-500 rounded-xl">
                    <SelectValue placeholder="Select Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year} className="text-sm sm:text-base">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm sm:text-base font-semibold flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-pink-500" />
                  Phone Number
                </Label>
                <Input 
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 9876543210"
                  maxLength={10}
                  className="h-11 sm:h-12 text-sm sm:text-base border-2 border-pink-200 focus:border-pink-500 rounded-xl"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                disabled={isCreating}
              >
                {isCreating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Your Profile...
                  </div>
                ) : (
                  "🚀 Create My CampusConnect Profile"
                )}
              </Button>
            </form>

            <div className="text-center text-xs sm:text-sm text-muted-foreground pt-4 border-t border-gray-200 dark:border-gray-700">
              Your information is secure and will only be used for campus services
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

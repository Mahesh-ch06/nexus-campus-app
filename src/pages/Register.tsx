import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { createUserProfile, checkHallTicketExists, checkEmailExists } from "@/services/userService";
import { awardRegistrationRewards } from "@/services/registrationRewardService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Phone, GraduationCap, Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    hallTicket: "",
    phoneNumber: "",
    department: "",
    academicYear: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

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

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.department || !formData.academicYear) {
      setError("Please select your department and academic year");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if hall ticket already exists
      const hallTicketExists = await checkHallTicketExists(formData.hallTicket);
      if (hallTicketExists) {
        setError("Hall ticket already registered");
        setLoading(false);
        return;
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setError("Email already registered");
        setLoading(false);
        return;
      }

      // Sign up with Supabase
      const { error: signUpError } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        const errorMessage = signUpError.message || "Registration failed. Please try again.";
        setError(errorMessage);
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get the newly created user from Supabase Auth
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      if (getUserError || !user) {
        console.error("Error getting user after signup:", getUserError);
        toast({
          title: "Registration Warning",
          description: "Account created but profile setup needed. Please log in to complete your profile.",
        });
        navigate("/login");
        return;
      }

      // Automatically create the user profile with registration data
      console.log("Creating user profile with registration data...");
      const profileData = {
        fullName: formData.fullName,
        hallTicket: formData.hallTicket,
        department: formData.department,
        academicYear: formData.academicYear,
        phoneNumber: formData.phoneNumber,
      };

      const createdProfile = await createUserProfile(user, profileData);
      
      if (createdProfile) {
        // Award registration rewards
        try {
          const rewards = await awardRegistrationRewards(createdProfile.id, user.email!);
          toast({
            title: "🎉 Welcome to CampusConnect!",
            description: rewards.message,
            duration: 5000,
          });
        } catch (rewardError) {
          console.error("Failed to award registration rewards:", rewardError);
          toast({
            title: "Registration Successful!",
            description: "Your account and profile have been created. Please check your email to verify your account.",
          });
        }
      } else {
        toast({
          title: "Registration Partially Complete",
          description: "Account created but profile setup incomplete. Please log in to complete your profile.",
        });
      }

      navigate("/login");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection.";
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: User, title: "Secure", description: "Your data is protected" },
    { icon: GraduationCap, title: "Academic", description: "Manage your campus life" },
    { icon: Mail, title: "Connected", description: "Stay updated with campus news" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Side - Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Logo className="text-white" width={28} height={28} />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CampusConnect
                </h1>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Join the Future of Campus Life
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect with thousands of students, access campus services instantly, 
                and make your college experience unforgettable.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Your Account</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Join the campus community and access all services
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>

                    {/* Hall Ticket */}
                    <div className="space-y-2">
                      <Label htmlFor="hallTicket" className="text-sm font-semibold">
                        Hall Ticket
                      </Label>
                      <Input
                        id="hallTicket"
                        placeholder="2023A51234"
                        value={formData.hallTicket}
                        onChange={(e) => handleInputChange("hallTicket", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@university.edu"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-semibold">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>

                    {/* Department & Academic Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Department</Label>
                        <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Academic Year</Label>
                        <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="h-12 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="h-12 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full h-12" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
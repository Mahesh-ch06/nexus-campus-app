import React, { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, User, Building, Shield, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { signUpPartner, getPartnerAuthErrorMessage } from "@/utils/partnerSupabaseAuth";
import { useTheme } from 'next-themes';
import { AuthError } from "@supabase/supabase-js";

const ProviderRegister = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    
    // Step 2 - Business Info
    businessName: "",
    serviceCategory: "",
    description: "",
    
    // Step 3 - Verification
    adminCode: ""
  });

  const serviceCategories = [
    "Food & Beverages",
    "Printing & Xerox",
    "Stationery & Supplies",
    "Laundry Services",
    "Books & Educational Materials",
    "Electronics & Gadgets",
    "Sports & Recreation",
    "Other Services"
  ];

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Business Info", icon: Building },
    { number: 3, title: "Verification", icon: Shield }
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
          toast.error("Please fill in all personal information fields");
          return false;
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
          toast.error("Phone number must be exactly 10 digits");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        break;
      case 2:
        if (!formData.businessName || !formData.serviceCategory || !formData.description) {
          toast.error("Please fill in all business information fields");
          return false;
        }
        break;
      case 3:
        if (formData.adminCode !== "CAMPUS_ADMIN_2024") {
          toast.error("Invalid admin code");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    
    try {
      await signUpPartner(formData.email, formData.password, {
        businessName: formData.businessName,
        category: formData.serviceCategory,
        description: formData.description
      });
      
      toast.success("Application submitted successfully! Please check your email for verification.");
      
      // Redirect to login page
      setTimeout(() => {
        navigate("/provider-login");
      }, 2000);
      
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof AuthError) {
        errorMessage = getPartnerAuthErrorMessage(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progress = (currentStep / (steps.length)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="sm" asChild className="group">
                <Link to="/provider-login" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
            </Button>
            <ThemeToggle />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
                          <Logo className="text-white" width={28} height={28} />
                      </div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          CampusConnect
                      </h1>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Provider Registration</h2>
                  <p className="text-gray-600 dark:text-gray-400">Join us to offer your services to the campus community</p>
              </div>
              
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pt-8 pb-6">
                  {/* Progress Indicator */}
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-4">
                      {steps.map((step, index) => (
                        <Fragment key={step.number}>
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              currentStep >= step.number 
                                ? 'bg-green-600 border-green-600 text-white' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'
                            }`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">{step.title}</span>
                          </div>
                          {index < steps.length - 1 && <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700 mt-[-1rem]"></div>}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-green-600 [&>div]:to-teal-600" />
                </CardHeader>
                
                <CardContent className="p-8 pt-4">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Personal Information</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about yourself</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@domain.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="10-digit phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ''))}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          maxLength={10}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password (min 6 characters)"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                      </div>

                      <Button onClick={handleNext} className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Business Info */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Business Information</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Details about your service</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="e.g., Campus Cafe, Quick Print Shop"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serviceCategory">Service Category</Label>
                        <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange("serviceCategory", value)}>
                          <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select your service category" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Service Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your services, specialties, and what makes you unique..."
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button onClick={handleNext} className="flex-1 h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Verification */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Verification</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Confirm your application details</p>
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white">Application Summary</h4>
                        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                          <p><span className="font-medium text-gray-700 dark:text-gray-200">Name:</span> {formData.fullName}</p>
                          <p><span className="font-medium text-gray-700 dark:text-gray-200">Email:</span> {formData.email}</p>
                          <p><span className="font-medium text-gray-700 dark:text-gray-200">Phone:</span> {formData.phone}</p>
                          <p><span className="font-medium text-gray-700 dark:text-gray-200">Business:</span> {formData.businessName}</p>
                          <p><span className="font-medium text-gray-700 dark:text-gray-200">Category:</span> {formData.serviceCategory}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adminCode">Admin Code</Label>
                        <Input
                          id="adminCode"
                          type="password"
                          placeholder="Enter the admin code"
                          value={formData.adminCode}
                          onChange={(e) => handleInputChange("adminCode", e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                          required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Contact campus administration for the verification code
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button 
                          onClick={handleSubmit} 
                          className="flex-1 h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? "Submitting..." : (
                            <>
                              Submit Application
                              <CheckCircle className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already a partner?{" "}
                      <Link to="/provider-login" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
                          Sign In
                      </Link>
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;

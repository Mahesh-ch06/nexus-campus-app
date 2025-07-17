
import Logo from "@/components/Logo";
import { Shield, Users, Zap } from "lucide-react";

const features = [
    { icon: Shield, title: "Secure Login", description: "Your data is protected with enterprise-grade security" },
    { icon: Users, title: "Join 10K+ Students", description: "Connect with the largest campus community" },
    { icon: Zap, title: "Instant Access", description: "Get access to all campus services immediately" }
];

const LoginInfoPanel = () => {
    return (
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
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Welcome Back to Your Campus
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                    Sign in to access your personalized campus experience and connect with your community.
                </p>
            </div>

            <div className="space-y-6">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoginInfoPanel;

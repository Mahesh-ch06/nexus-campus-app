
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { ArrowRight, BookOpen, Utensils, Printer, ShoppingCart, Calendar, GraduationCap, Users, Menu } from 'lucide-react';
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Utensils className="h-8 w-8 text-primary-600" />,
      title: "Campus Eats",
      description: "Order delicious and healthy meals from campus canteens and cafes.",
      color: "blue"
    },
    {
      icon: <Printer className="h-8 w-8 text-primary-600" />,
      title: "Printing Services",
      description: "Submit documents for printing from anywhere and collect them hassle-free.",
      color: "green"
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-primary-600" />,
      title: "Campus Store",
      description: "Get your stationery, snacks, and other essentials delivered to you.",
      color: "purple"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary-600" />,
      title: "Events & Clubs",
      description: "Discover and join exciting events, workshops, and clubs on campus.",
      color: "red"
    },
  ];

  const benefits = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Streamline Your Day",
      description: "Access all campus services from a single app, saving you time and effort."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Stay Connected",
      description: "Never miss an update on campus life, from events to important announcements."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Focus on Studies",
      description: "With daily hassles managed, you can dedicate more time to what matters most."
    },
  ];
  
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "B.Tech, CSE Student",
      quote: "CampusConnect has been a game-changer! I can order food and get my notes printed without leaving the library. It saves me so much time.",
      avatar: "/placeholder.svg"
    },
    {
      name: "Rahul Verma",
      role: "President, Tech Club",
      quote: "Organizing events is so much easier now. We can reach more students and manage registrations seamlessly through the app.",
      avatar: "/placeholder.svg"
    },
    {
      name: "Dr. Anjali Mehta",
      role: "Professor, ECE Dept.",
      quote: "The platform enhances student engagement and simplifies access to campus resources. A brilliant initiative for a modern university.",
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">CampusConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
              <a href="#benefits" className="text-muted-foreground transition-colors hover:text-foreground">Benefits</a>
              <a href="#testimonials" className="text-muted-foreground transition-colors hover:text-foreground">Testimonials</a>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Student Login</Link>
              </Button>
              <Button asChild>
                <Link to="/provider/login">Partner Login</Link>
              </Button>
            </div>
            <ThemeToggle />
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <Logo className="h-7 w-7 text-primary" />
                        <span className="text-lg font-bold">CampusConnect</span>
                      </Link>
                    </div>
                    <nav className="flex flex-col gap-6 mt-10">
                      <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Features</a>
                      <a href="#benefits" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Benefits</a>
                      <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Testimonials</a>
                    </nav>
                    <div className="mt-auto pt-6 flex flex-col gap-4">
                       <Button variant="outline" asChild>
                        <Link to="/login">Student Login</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/provider/login">Partner Login</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom mask-gradient"></div>
          <div className="container relative z-10 text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tighter mb-6">
              The <span className="text-gradient">Smart Campus</span> Experience
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              CampusConnect is your all-in-one platform for a seamless university life. Order food, print documents, buy essentials, and stay updated with campus events - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/provider/register">Become a Partner</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">All-in-One Campus Solution</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need for your campus life, right at your fingertips.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Why You'll Love CampusConnect</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We focus on simplifying your university experience so you can focus on your growth.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{benefit.title}</h3>
                    <p className="mt-2 text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">From Our Community</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what students and faculty are saying about CampusConnect.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-background shadow-lg animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                Ready to <span className="text-gradient">Upgrade</span> Your Campus Life?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10">
                Join thousands of students and partners who are already part of the smart campus revolution.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Create Student Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/provider/register">Join as a Partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff-portal">🌟 Staff Access</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

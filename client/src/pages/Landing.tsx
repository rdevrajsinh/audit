import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Server, Search, FileText, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Server,
      title: "Asset Discovery",
      description: "Automatically discover and catalog all your digital assets across networks and cloud environments.",
    },
    {
      icon: Search,
      title: "Vulnerability Scanning",
      description: "Comprehensive security scans using industry-standard tools like OWASP ZAP and Nmap.",
    },
    {
      icon: Users,
      title: "IAM Auditing",
      description: "Audit identity and access management across Google Workspace, Microsoft 365, and AWS.",
    },
    {
      icon: CheckCircle,
      title: "Compliance Reporting",
      description: "Generate compliance reports for ISO 27001, SOC 2, GDPR and other frameworks.",
    },
    {
      icon: FileText,
      title: "Executive Reports",
      description: "Professional PDF reports tailored for both technical teams and executives.",
    },
    {
      icon: Shield,
      title: "Real-time Monitoring",
      description: "Continuous monitoring with alerts for critical security issues and misconfigurations.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border/60 dark:border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Audit Capsule
                </h1>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Security Audit Platform
                </p>
              </div>
            </div>
            <Button onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground dark:text-foreground mb-6">
            Automated Security Audits
            <span className="text-primary block">for Modern Businesses</span>
          </h2>
          <p className="text-xl text-muted-foreground dark:text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive security assessments, vulnerability scanning, and compliance reporting 
            designed specifically for small and medium enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = "/register"}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 dark:border-border/50 bg-card/50 dark:bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 dark:bg-primary/10 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-foreground dark:text-foreground mb-4">
            Ready to Secure Your Business?
          </h3>
          <p className="text-lg text-muted-foreground dark:text-muted-foreground mb-8">
            Join hundreds of businesses using Audit Capsule to improve their security posture.
          </p>
          <Button size="lg" onClick={() => window.location.href = "/register"}>
            Start Your Security Assessment
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 dark:bg-card/50 backdrop-blur-sm border-t border-border/60 dark:border-border/60 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground dark:text-muted-foreground">
              © 2025 Audit Capsule. Built for security professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

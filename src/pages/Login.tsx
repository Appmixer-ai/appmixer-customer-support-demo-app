import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Eye,
  EyeOff,
  MessageSquare,
  BarChart3,
  Users,
  Bell,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    if (isSignupMode && (!firstName || !lastName)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields including first and last name",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignupMode) {
        const { error } = await signUpWithEmail(email, password, firstName, lastName);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign Up Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
          // Switch to login mode after successful signup
          setIsSignupMode(false);
          setFirstName("");
          setLastName("");
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: isSignupMode ? "Failed to sign up. Please try again." : "Failed to sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to sign in with Google",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <div className="relative mt-5 h-auto text-3xl font-semibold">
              Your SaaS
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Imagine this is your SaaS, powered by AI automation features by
              Appmixer.
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center">
                {isSignupMode ? "Create Account" : "Sign in"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignupMode && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignupMode && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2"></div>
                    <a
                      href="#"
                      className="text-sm text-primary hover:text-primary/80"
                      onClick={(e) => {
                        e.preventDefault();
                        toast({
                          title: "Password Reset",
                          description:
                            "Password reset functionality would be implemented here.",
                        });
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? isSignupMode
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignupMode
                      ? "Create Account"
                      : "Sign in"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              {/* Toggle between login and signup */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignupMode
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignupMode(!isSignupMode);
                      setFirstName("");
                      setLastName("");
                    }}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {isSignupMode ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:text-primary/80">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:text-primary/80">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Dashboard Preview */}
      <div
        className="flex-1 border-l border-gray-200 flex justify-center p-8 relative flex-col"
        style={{ backgroundColor: "rgba(240, 242, 246, 1)" }}
      >
        {/* Feature Preview */}
        <div className="text-center mt-6 text-lg font-normal text-gray-900 leading-7">
          Experience your next biggest product upgrade
        </div>

        {/* Dashboard Preview Image */}
        <div className="w-full flex flex-col">
          <img
            src={`https://cdn.builder.io/api/v1/image/assets%2F${import.meta.env.VITE_BUILDER_IO_PROJECT_ID || '30d17f7f0f65497789306b2ad9a1c9a1'}%2F37555416c9254efea8435d1ceb901d65?format=webp&width=1600`}
            alt="Dashboard Preview"
            className="h-auto rounded-lg mr-auto"
            style={{ width: "120%", maxWidth: "800px" }}
          />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Explore how Appmixer features work inside a SaaS application with
            this demo app.
          </p>
        </div>

        {/* Appmixer logo in bottom right corner */}
        <div className="absolute bottom-6 right-6">
          <img
            src={`https://cdn.builder.io/api/v1/image/assets%2F${import.meta.env.VITE_BUILDER_IO_PROJECT_ID || '30d17f7f0f65497789306b2ad9a1c9a1'}%2Fce706cf77dd444eda60818cdfa16cac7?format=webp&width=800`}
            alt="Appmixer"
            className="h-8 object-contain"
          />
        </div>
      </div>
    </div>
  );
}

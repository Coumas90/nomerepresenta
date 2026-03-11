import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { HCaptchaComponent, type HCaptchaRef } from "@/components/auth/HCaptcha";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, loading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaRef>(null);

  // Rate limiter for login attempts
  const loginRateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minute lockout
    storageKey: 'login_rate_limit',
  });

  // Rate limiter for password reset attempts
  const resetRateLimiter = useRateLimiter({
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
    storageKey: 'reset_rate_limit',
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (loginRateLimiter.isLocked()) {
      const interval = setInterval(() => {
        const remaining = loginRateLimiter.getRemainingLockoutTime();
        setLockoutCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loginRateLimiter]);

  useEffect(() => {
    if (user && !loading && !roleLoading) {
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, loading, roleLoading, userRole, navigate]);

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token },
      });
      
      if (error) {
        console.error('CAPTCHA verification error:', error);
        return false;
      }
      
      return data?.success === true;
    } catch (err) {
      console.error('CAPTCHA verification failed:', err);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit before attempting
    if (!loginRateLimiter.canAttempt()) {
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${loginRateLimiter.formatRemainingTime()} before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Check if CAPTCHA is required and not completed
    if (loginRateLimiter.requiresCaptcha(3) && !captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }
    
    // Normalize credentials
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    const validation = authSchema.safeParse({ 
      email: normalizedEmail, 
      password: normalizedPassword 
    });
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Verify CAPTCHA in backend if required
    if (loginRateLimiter.requiresCaptcha(3) && captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        setIsSubmitting(false);
        setCaptchaToken(null);
        captchaRef.current?.reset();
        toast({
          title: "CAPTCHA Verification Failed",
          description: "Please complete the CAPTCHA again.",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await signIn(normalizedEmail, normalizedPassword);
    setIsSubmitting(false);

    if (error) {
      // Record failed attempt
      const { blocked, remainingAttempts } = loginRateLimiter.recordFailedAttempt(normalizedEmail);
      
      // Reset CAPTCHA after failed attempt
      setCaptchaToken(null);
      captchaRef.current?.reset();
      
      if (blocked) {
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed attempts. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: remainingAttempts > 0 
            ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
            : "Invalid login credentials. Please check your email and password.",
          variant: "destructive",
        });
      }
    } else {
      // Reset rate limiter on successful login
      loginRateLimiter.recordSuccess();
      setCaptchaToken(null);
      
      // Prefetch admin data while showing toast
      const startDate = subDays(new Date(), 7);
      const endDate = new Date();
      
      queryClient.prefetchQuery({
        queryKey: ['artworks'],
        queryFn: async () => {
          const { data } = await supabase
            .from("artworks")
            .select("*")
            .order("display_order", { ascending: true });
          return data;
        }
      });
      
      queryClient.prefetchQuery({
        queryKey: ['analytics-stats', startDate.toISOString(), endDate.toISOString()],
        queryFn: async () => {
          const { data: sessions } = await supabase
            .from('analytics_sessions')
            .select('started_at, total_duration_seconds')
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString());
          return sessions;
        }
      });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
  };

  const RESET_WHITELIST = [
    "ivncoms@gmail.com",
    "ianrebbel@gmail.com",
    "contact@ivancomas.studio",
    "contact@spiritualized.cc",
  ];

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit for password reset
    if (!resetRateLimiter.canAttempt()) {
      toast({
        title: "Too Many Requests",
        description: `Please wait ${resetRateLimiter.formatRemainingTime()} before requesting another reset.`,
        variant: "destructive",
      });
      return;
    }
    
    const normalizedResetEmail = resetEmail.trim().toLowerCase();
    const emailValidation = z.string().email().safeParse(normalizedResetEmail);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!RESET_WHITELIST.includes(normalizedResetEmail)) {
      // Show same generic message to prevent email enumeration
      toast({
        title: "Email Sent!",
        description: "If an account exists with this email, you'll receive a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
      return;
    }

    setIsSubmitting(true);
    
    // Password Recovery Flow:
    // 1. This sends an email with a recovery link to the user
    // 2. The link points to /reset-password on this domain (must match Supabase Site URL)
    // 3. Supabase appends #access_token=...&type=recovery to the URL
    // 4. ResetPassword.tsx detects the session and allows password update
    // Important: Make sure Supabase Auth settings have the correct Site URL and Redirect URLs
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedResetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);

    // Always record the attempt
    resetRateLimiter.recordFailedAttempt(normalizedResetEmail);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Sent!",
        description: "If an account exists with this email, you'll receive a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-black">
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-background/80 border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle>{showForgotPassword ? "Reset Password" : "Admin Sign In"}</CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? "Enter your email to receive a password reset link" 
              : "Sign in to access the admin panel"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Rate limit warning */}
              {loginRateLimiter.isLocked() && (
                <Alert variant="destructive" className="mb-4">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    Account temporarily locked due to too many failed attempts. 
                    Please wait {loginRateLimiter.formatRemainingTime()} before trying again.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Attempts remaining warning */}
              {!loginRateLimiter.isLocked() && loginRateLimiter.attempts > 0 && (
                <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-500/10">
                  <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                    {loginRateLimiter.getRemainingAttempts()} login attempts remaining
                  </AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
              
              {/* CAPTCHA - shown after 3 failed attempts */}
              {loginRateLimiter.requiresCaptcha(3) && (
                <div className="space-y-2">
                  <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                      Please complete the CAPTCHA to continue
                    </AlertDescription>
                  </Alert>
                  <HCaptchaComponent
                    ref={captchaRef}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                  {captchaToken && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm justify-center">
                      <ShieldCheck className="h-4 w-4" />
                      CAPTCHA verified
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || loginRateLimiter.isLocked() || (loginRateLimiter.requiresCaptcha(3) && !captchaToken)}
              >
                {isSubmitting ? "Signing in..." : loginRateLimiter.isLocked() ? `Locked (${loginRateLimiter.formatRemainingTime()})` : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

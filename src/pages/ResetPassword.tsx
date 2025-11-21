import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { P5Background } from "@/components/P5Background";

const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(100);

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Recovery Flow Validation:
    // When user clicks the email link, they arrive here with #access_token=...&type=recovery
    // Supabase automatically processes the hash and creates a temporary session
    // We verify that session exists before allowing password reset
    
    console.log('🔐 ResetPassword: Checking for recovery session...', {
      pathname: window.location.pathname,
      hasHash: !!window.location.hash,
      hashPreview: window.location.hash.substring(0, 50)
    });

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
      }
      
      if (!session) {
        console.warn('⚠️ No recovery session found');
        toast({
          title: "Invalid or expired link",
          description: "The password reset link has been used or has expired. Please request a new one.",
          variant: "destructive",
        });
        
        // Give user time to read the message before redirect
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } else {
        console.log('✅ Valid recovery session detected');
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('🔄 Attempting password update...');
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    setIsSubmitting(false);

    if (error) {
      console.error('❌ Password update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password. The link may have expired.",
        variant: "destructive",
      });
    } else {
      console.log('✅ Password updated successfully');
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset. You can now sign in.",
      });
      
      // Redirect to auth page after brief delay
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <P5Background />
      <Card className="w-full max-w-md backdrop-blur-xl bg-background/80 border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

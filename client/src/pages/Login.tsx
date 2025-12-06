import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const { t, isRTL } = useLanguage();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      await signInWithGoogle();
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      await signInWithEmail(loginEmail, loginPassword);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signUpWithEmail(registerEmail, registerPassword, registerName);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "ms-2 rotate-180" : "me-2"}`} />
          {isRTL ? "العودة للمتجر" : "Back to Store"}
        </Button>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isRTL ? "مرحباً بك" : "Welcome"}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? "سجل دخولك أو أنشئ حساباً جديداً"
                  : "Sign in to your account or create a new one"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || loading}
                data-testid="button-google-signin"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <SiGoogle className="h-4 w-4 me-2" />
                )}
                {isRTL ? "تسجيل الدخول بواسطة Google" : "Continue with Google"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {isRTL ? "أو" : "or"}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" data-testid="error-message">
                  {error}
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">
                    {isRTL ? "تسجيل الدخول" : "Sign In"}
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">
                    {isRTL ? "إنشاء حساب" : "Sign Up"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        data-testid="input-login-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">
                        {isRTL ? "كلمة المرور" : "Password"}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      data-testid="button-login"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                      ) : null}
                      {isRTL ? "تسجيل الدخول" : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">
                        {isRTL ? "الاسم" : "Name"}
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        data-testid="input-register-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">
                        {isRTL ? "كلمة المرور" : "Password"}
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={6}
                        data-testid="input-register-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">
                        {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      data-testid="button-register"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                      ) : null}
                      {isRTL ? "إنشاء حساب" : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

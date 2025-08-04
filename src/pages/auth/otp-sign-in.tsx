import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, Mail } from "lucide-react";
import Plane from "@/components/logos/plane";

type AuthStep = "email" | "otp";
type AuthFlow = "signIn" | "signUp";

interface AuthState {
  step: AuthStep;
  flow: AuthFlow;
  email: string;
  isNewUser: boolean;
}

export function OTPSignInPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  const [authState, setAuthState] = useState<AuthState>({
    step: "email",
    flow: "signIn",
    email: "",
    isNewUser: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");

  // Handle soft navigation when authentication completes
  if (isAuthenticated) {
    navigate("/app", { replace: true });
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    try {
      // First, try to send OTP
      await signIn("resend-otp", formData);

      setAuthState((prev) => ({
        ...prev,
        step: "otp",
        email,
        isNewUser: authState.flow === "signUp",
      }));

      setSuccess(
        "Verification code sent to your email! \n Please check Spam folder if you don't find the mail.",
      );
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Check if this is a "user not found" error for sign in
      if (
        authState.flow === "signIn" &&
        errorMessage.includes("user not found")
      ) {
        setError("No account found with this email. Please sign up first.");
      } else if (
        authState.flow === "signUp" &&
        errorMessage.includes("user already exists")
      ) {
        setError(
          "An account with this email already exists. Please sign in instead.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("code", otpValue); // Use the OTP value from state

    try {
      await signIn("resend-otp", formData);
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("email", authState.email);

    try {
      await signIn("resend-otp", formData);
      setSuccess("New verification code sent to your email!");
    } catch (err) {
      setError("Failed to resend verification code. Please try again.");
      console.error("Resend OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setAuthState({
      step: "email",
      flow: "signIn",
      email: "",
      isNewUser: false,
    });
    setOtpValue("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card border rounded-lg p-8 shadow-lg">
        <div className="text-center space-y-2">
          <div className="flex space-x-1 items-center justify-center mb-6 text-xl font-medium">
            <Plane /> <span>Aura Campaigns</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {authState.step === "email" &&
              (authState.flow === "signIn"
                ? "Welcome Back!"
                : "Create Account")}
            {authState.step === "otp" && "Verify Your Email"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {authState.step === "email" &&
              (authState.flow === "signIn"
                ? "Sign in to your Aura Campaigns account"
                : "Get started with Aura Campaigns")}
            {authState.step === "otp" &&
              `Enter the 8-digit code sent to ${authState.email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500/20 bg-green-500/10 text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Email Step */}
        {authState.step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authState.flow === "signIn"
                ? "Send Sign In Code"
                : "Send Verification Code"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                {authState.flow === "signIn"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setAuthState((prev) => ({
                    ...prev,
                    flow: prev.flow === "signIn" ? "signUp" : "signIn",
                  }))
                }
                className="ml-2 text-sm text-primary hover:text-primary/80"
                disabled={loading}
              >
                {authState.flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </div>
            {/* <div className="text-center flex items-center space-x-2">
              <span className="text-sm text-foreground">
                Don't want to sign up, view a demo account
              </span>
              <Link to={"/signin"}>
                <span className="text-sm text-primary hover:underline">
                  Demo Sign In
                </span>
              </Link>
            </div> */}
          </form>
        )}

        {/* OTP Step */}
        {authState.step === "otp" && (
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => setOtpValue(value)}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <input name="email" value={authState.email} type="hidden" />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otpValue.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={resendOTP}
                className="text-primary hover:text-primary/80"
                disabled={loading}
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default OTPSignInPage;

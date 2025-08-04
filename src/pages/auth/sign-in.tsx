"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import Plane from "@/components/logos/plane";

export function SignInPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const { isAuthenticated } = useConvexAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    try {
      setLoading(true);
      await signIn("password", formData);
      // return navigate("/app");
    } catch (error) {
      console.error(error);
      toast.error("Email or password is wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle soft navigation when authentication completes
  if (isAuthenticated) {
    navigate("/app", { replace: true });
    return null;
  }

  return (
    <div className="grid place-content-center w-full h-screen">
      <div className="flex space-x-1 items-center justify-center mb-6 text-xl font-medium">
        <Plane /> <span>Aura Campaigns</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground my-4">
        {flow === "signIn" ? "Welcome Back!" : "Create new account"}
      </h1>
      <form
        className="flex flex-col gap-2 w-96"
        onSubmit={(e) => {
          handleSubmit(e).catch(console.error);
        }}
      >
        <Input type="email" name="email" placeholder="Email" />

        <Input type="password" name="password" placeholder="Password" />
        <Button className="cursor-pointer" type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {!loading && (flow === "signIn" ? "Sign in" : "Sign up")}
        </Button>
        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
      </form>
    </div>
  );
}

export default SignInPage;

"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export function SignInPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
      return navigate("/app");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="grid place-content-center w-full h-screen">
      <form
        className="flex flex-col gap-2 w-96"
        onSubmit={(e) => {
          handleSubmit(e).catch(console.error);
        }}
      >
        <Input type="email" name="email" placeholder="Email" />

        <Input type="password" name="password" placeholder="Password" />
        <Button className="cursor-pointer" type="submit">
          {flow === "signIn" ? "Sign in" : "Sign up"}
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
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default SignInPage;

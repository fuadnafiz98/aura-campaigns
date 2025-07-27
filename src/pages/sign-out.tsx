import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SignOutPage() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  useEffect(() => {
    const doSignOut = async () => {
      try {
        await signOut();
        await navigate("/login");
      } catch (error) {
        console.error(error);
      }
    };
    void doSignOut();
  }, [signOut, navigate]);

  return <div>Signing out...</div>;
}

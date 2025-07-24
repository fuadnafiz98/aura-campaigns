import { useConvexAuth } from "convex/react";
import { Button } from "./components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";

export default function App() {
  return (
    <div className="grid place-content-center my-32 text-lg">
      <SignOutButton />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  return (
    <>
      {isAuthenticated && (
        <Button
          onClick={() => {
            void navigate("/signout");
          }}
        >
          Sign out
        </Button>
      )}
    </>
  );
}

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { HomePage } from "./pages/Home";
import { SignInPage } from "./pages/SignIn";

import { SignOutPage } from "./pages/SignOut";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index
        element={
          <Authenticated>
            <HomePage />
          </Authenticated>
        }
      />
      <Route
        path="login"
        element={
          <Unauthenticated>
            <SignInPage />
          </Unauthenticated>
        }
      />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        }
      />
      <Route path="signout" element={<SignOutPage />} />
    </Route>,
  ),
);

export function Router() {
  return <RouterProvider router={router} />;
}

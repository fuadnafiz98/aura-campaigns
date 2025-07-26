import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { SignInPage } from "./pages/SignIn";

import { SignOutPage } from "./pages/SignOut";
import { Skeleton } from "./components/ui/skeleton";
import WithSideBar from "./components/with-sidebar";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index
        element={
          <>
            <AuthLoading>
              <Skeleton className="h-full m-4" />
            </AuthLoading>
            <Authenticated>
              <WithSideBar label="Dashboard">
                <div>Dashboard</div>
              </WithSideBar>
            </Authenticated>
            <Unauthenticated>
              <SignInPage />
            </Unauthenticated>
          </>
        }
      />
      <Route
        path="login"
        element={
          <>
            <AuthLoading>
              <Skeleton className="h-full m-4" />
            </AuthLoading>
            <Unauthenticated>
              <SignInPage />
            </Unauthenticated>
          </>
        }
      />
      <Route
        path="dashboard"
        element={
          <WithSideBar label="Dashboard">
            <>
              <AuthLoading>
                <Skeleton className="h-full m-4" />
              </AuthLoading>
              <Authenticated>
                <div>Dashboard</div>
              </Authenticated>
            </>
          </WithSideBar>
        }
      />
      <Route
        path="leads"
        element={
          <WithSideBar label="Leads">
            <>
              <AuthLoading>
                <Skeleton className="h-full m-4" />
              </AuthLoading>
              <Authenticated>
                <div>Leads</div>
              </Authenticated>
            </>
          </WithSideBar>
        }
      />
      <Route
        path="campaigns"
        element={
          <WithSideBar label="Campaigns">
            <>
              <AuthLoading>
                <Skeleton className="h-full m-4" />
              </AuthLoading>
              <Authenticated>
                <div>Camp</div>
              </Authenticated>
            </>
          </WithSideBar>
        }
      />
      <Route path="signout" element={<SignOutPage />} />
    </Route>,
  ),
);

export function Router() {
  return <RouterProvider router={router} />;
}

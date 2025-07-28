import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import React, { Suspense } from "react";

import App from "./App";
import { Skeleton } from "./components/ui/skeleton";

const SignInPage = React.lazy(() => import("./pages/sign-in"));
const SignOutPage = React.lazy(() => import("./pages/sign-out"));
const LeadsPage = React.lazy(() => import("./pages/leads"));
const EmailCampaignFlow = React.lazy(() => import("./pages/campaigns"));
const WithSideBar = React.lazy(() => import("./components/with-sidebar"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index
        element={
          <>
            <AuthLoading>
              <div className="flex flex-col items-center justify-center h-screen w-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-muted-foreground text-base font-medium">
                  Loading ...
                </span>
              </div>
            </AuthLoading>
            <Authenticated>
              <WithSideBar label="Dashboard">
                <div>Dashboard</div>
              </WithSideBar>
            </Authenticated>
            <Unauthenticated>
              <Suspense fallback={<Skeleton className="h-full m-4" />}>
                <SignInPage />
              </Suspense>
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
              <Suspense fallback={<Skeleton className="h-full m-4" />}>
                <SignInPage />
              </Suspense>
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
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  <LeadsPage />
                </Suspense>
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
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  <EmailCampaignFlow />
                </Suspense>
              </Authenticated>
            </>
          </WithSideBar>
        }
      />
      <Route
        path="signout"
        element={
          <Suspense fallback={<Skeleton className="h-full m-4" />}>
            <SignOutPage />
          </Suspense>
        }
      />
    </Route>,
  ),
);

export function Router() {
  return <RouterProvider router={router} />;
}

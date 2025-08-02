import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import React, { Suspense } from "react";

import { Skeleton } from "./components/ui/skeleton";
import LoadingScreen from "./components/loading-screen";
// import LandingPage from "./pages/landing";
import ErrorBoundary from "./components/error-boundary";
import LandingPage from "./pages/landing";

const App = React.lazy(() => import("./App"));
const WithSideBar = React.lazy(() => import("./components/with-sidebar"));
const NotFoundPage = React.lazy(() => import("./pages/not-found"));
// Auth
const SignInPage = React.lazy(() => import("./pages/auth/sign-in"));
const OTPSignInPage = React.lazy(() => import("./pages/auth/otp-sign-in"));
const SignOutPage = React.lazy(() => import("./pages/sign-out"));
// Leads
const LeadsPage = React.lazy(() => import("./pages/leads"));

// Campaigns
const CampaignsPage = React.lazy(() => import("./pages/campaigns/list"));
const EmailCampaignFlow = React.lazy(() => import("./pages/campaigns/show"));

// Analytics
const AnalyticsPage = React.lazy(() => import("./pages/analytics"));

// Dashboard
const EmailLogsPage = React.lazy(() => import("./pages/email-logs"));

// Audiences
const AudiencePage = React.lazy(() => import("./pages/audiences"));
const AudienceDetailPage = React.lazy(() => import("./pages/audiences/detail"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<LandingPage />}
        errorElement={<ErrorBoundary />}
      />

      <Route path="/app" element={<App />} errorElement={<ErrorBoundary />}>
        <Route
          index
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Dashboard"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Dashboard">
                  <EmailLogsPage />
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="dashboard"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Dashboard"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Dashboard">
                  <EmailLogsPage />
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
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
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="analytics"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Analytics Page"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Analytics">
                  <AnalyticsPage />
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="leads"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Leads"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Leads">
                  <Suspense fallback={<Skeleton className="h-full m-4" />}>
                    <LeadsPage />
                  </Suspense>
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="campaigns"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Campaigns"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Campaigns">
                  <Suspense fallback={<Skeleton className="h-full m-4" />}>
                    <CampaignsPage />
                  </Suspense>
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="campaigns/:campaignId"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Campaign Details"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Campaign Details">
                  <Suspense fallback={<Skeleton className="h-full m-4" />}>
                    <EmailCampaignFlow />
                  </Suspense>
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="audiences"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Audiences"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Audiences">
                  <Suspense fallback={<Skeleton className="h-full m-4" />}>
                    <AudiencePage />
                  </Suspense>
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
        <Route
          path="audiences/:audienceId"
          element={
            <>
              <AuthLoading>
                <LoadingScreen label={"Audience Details"} />
              </AuthLoading>
              <Authenticated>
                <WithSideBar label="Audience Details">
                  <Suspense fallback={<Skeleton className="h-full m-4" />}>
                    <AudienceDetailPage />
                  </Suspense>
                </WithSideBar>
              </Authenticated>
              <Unauthenticated>
                <Suspense fallback={<Skeleton className="h-full m-4" />}>
                  {/* <SignInPage /> */}
                  <OTPSignInPage />
                </Suspense>
              </Unauthenticated>
            </>
          }
        />
      </Route>

      {/* Standalone routes */}
      <Route
        path="/signin"
        element={
          <>
            <AuthLoading>
              <Skeleton className="h-full m-4" />
            </AuthLoading>
            <Authenticated>
              {/* Redirect to app if already authenticated */}
              <Navigate to="/app" replace />
            </Authenticated>
            <Unauthenticated>
              <Suspense fallback={<Skeleton className="h-full m-4" />}>
                <SignInPage />
              </Suspense>
            </Unauthenticated>
          </>
        }
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/login"
        element={
          <>
            <AuthLoading>
              <Skeleton className="h-full m-4" />
            </AuthLoading>
            <Authenticated>
              {/* Redirect to app if already authenticated */}
              <Navigate to="/app" replace />
            </Authenticated>
            <Unauthenticated>
              <Suspense fallback={<Skeleton className="h-full m-4" />}>
                <OTPSignInPage />
              </Suspense>
            </Unauthenticated>
          </>
        }
        errorElement={<ErrorBoundary />}
      />

      <Route
        path="/otp-sign-in"
        element={
          <>
            <AuthLoading>
              <Skeleton className="h-full m-4" />
            </AuthLoading>
            <Authenticated>
              {/* Redirect to app if already authenticated */}
              <Navigate to="/app" replace />
            </Authenticated>
            <Unauthenticated>
              <Suspense fallback={<Skeleton className="h-full m-4" />}>
                <OTPSignInPage />
              </Suspense>
            </Unauthenticated>
          </>
        }
        errorElement={<ErrorBoundary />}
      />

      <Route
        path="/signout"
        element={
          <Suspense fallback={<Skeleton className="h-full m-4" />}>
            <SignOutPage />
          </Suspense>
        }
        errorElement={<ErrorBoundary />}
      />

      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingScreen label={"Loading"} />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </>,
  ),
);

export function Router() {
  return <RouterProvider router={router} />;
}

import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import StudentNav from "./components/StudentNav";
import About from "./pages/About";
import Announcements from "./pages/Announcements";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import QueryPage from "./pages/Query";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import RequestAccess from "./pages/admin/RequestAccess";
import { isAdminLoggedIn } from "./utils/adminSession";

function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute();

const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "student-layout",
  component: StudentLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/",
  component: Home,
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/$reg",
  component: StudentDashboard,
});

const announcementsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/announcements",
  component: Announcements,
});

const notificationsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/notifications",
  component: Notifications,
});

const aboutRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/about",
  component: About,
});

const queryRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/query",
  component: QueryPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  beforeLoad: () => {
    if (!isAdminLoggedIn()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

const requestAccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/request-access",
  component: RequestAccess,
});

const routeTree = rootRoute.addChildren([
  studentLayoutRoute.addChildren([
    homeRoute,
    studentDashboardRoute,
    announcementsRoute,
    notificationsRoute,
    aboutRoute,
    queryRoute,
  ]),
  adminLoginRoute,
  adminDashboardRoute,
  requestAccessRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

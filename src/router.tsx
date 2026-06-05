import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { CardProvider } from "./state/CardContext";
import LandingPage from "./routes/landing";
import EditorPage from "./routes/editor";
import GuidePage from "./routes/guide";

// Vite base is "/chara-snap-enhanced/"; the router basepath is the same
// without the trailing slash. Override via VITE_BASE for custom domains.
const rawBase = import.meta.env.BASE_URL || "/";
const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

const rootRoute = createRootRoute({
  component: () => (
    <CardProvider>
      <Outlet />
    </CardProvider>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: EditorPage,
});

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guide",
  component: GuidePage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  editorRoute,
  guideRoute,
]);

export const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

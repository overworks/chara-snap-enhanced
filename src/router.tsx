import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { CardProvider } from "./state/CardContext";
import { SettingsProvider } from "./state/SettingsContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { I18nProvider } from "./i18n";
import LandingPage from "./routes/landing";
import EditorPage from "./routes/editor";
import GuidePage from "./routes/guide";
import ChangesPage from "./routes/changes";
import SettingsPage from "./routes/settings";

// Vite base is "/chara-snap-enhanced/"; the router basepath is the same
// without the trailing slash. Override via VITE_BASE for custom domains.
const rawBase = import.meta.env.BASE_URL || "/";
const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <I18nProvider>
        <SettingsProvider>
          <CardProvider>
            <Outlet />
          </CardProvider>
        </SettingsProvider>
      </I18nProvider>
    </ThemeProvider>
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

const changesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/changes",
  component: ChangesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  editorRoute,
  guideRoute,
  changesRoute,
  settingsRoute,
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

import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PageLoader } from "./components/page-loader";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: PageLoader,
    // Portal routes run an auth check in `beforeLoad` (two server calls), so a
    // nav click can take a beat. The router's 1s default meant that beat passed
    // with zero feedback — the click looked ignored and the old page just sat
    // there. Show the loader almost immediately instead.
    defaultPendingMs: 120,
    // Pairs with the above: the 500ms default would pad quick navigations out
    // to half a second of spinner. Just long enough to avoid a flash.
    defaultPendingMinMs: 240,
  });

  return router;
};

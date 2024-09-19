import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {flatRoutes} from "remix-flat-routes"

export default defineConfig({
  plugins: [
    remix({
      routes: async (defineRoutes) => flatRoutes('routes', defineRoutes),
      future: {
        v3_fetcherPersist: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});

/*
 * Persona: Tough love meets soul care.
 * Module: vite
 * Intent: Handle functionality for vite
 * Provenance-ID: ce8b25cb-6763-4b0e-81a9-c4048fdc4c7f
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Source: SalleCompanion-1/server/vite.ts (migrated 2025-08-27)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Server } from "http";
import { nanoid } from "nanoid";

// Dynamic import for vite to avoid CommonJS/ESM issues
let createViteServer: any;
let createLogger: any;

(async () => {
  const vite = await import("vite");
  createViteServer = vite.createServer;
  createLogger = vite.createLogger;
})();

const viteLogger = createLogger ? createLogger() : console;

export function log(message: string, source = "express") { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Provenance: Sallie-1/server/vite.ts - formattedTime reserved for future timestamp logging
  const formattedTime = new Date().toLocaleTimeString("en-US", { // eslint-disable-line @typescript-eslint/no-unused-vars
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Logging removed for production
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options?: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      // ...existing code...
    } catch (err) {
      next(err);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function serveStatic(app: Express) {
  // ...existing code for static serving...
}

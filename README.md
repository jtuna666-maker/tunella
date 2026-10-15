# Tunella

Marketing website for Tunella, an AI phone receptionist for local contractors. Built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide icons.

## Local development

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To verify a release locally:

```sh
npm run typecheck
npm run build
npm start
```

The development and build scripts use Webpack. On this Mac, Next.js falls back to its WebAssembly compiler because macOS rejects the native SWC binary; the production build still completes. No system security settings were changed.

## Editing

- `app/page.tsx`: landing page, pricing calculator, FAQ, simulated sample call, and demo modal.
- `app/globals.css`: global styles and reduced-motion support.
- `app/layout.tsx`: page title, description, and document language.

The initial landing page was imported from Gemini Canvas. Project configuration, accessibility fixes, and build checks were added afterward.

## Before launch

The demo form currently validates inputs and displays a simulated success state. It does **not** transmit or store requests. Replace the clearly marked endpoint TODO in `handleDemoSubmit` with a real submission handler, including network error handling, before accepting customer requests.

Replace the clearly marked contact email TODO in the footer. The sample call uses a transcript and synthesized audio cues, rather than a recorded call.

## Vercel

Automatic Git deployments are disabled in `vercel.json` through `git.deploymentEnabled: false`. The Vercel project is [jesse-783d/tunella](https://vercel.com/jesse-783d/tunella), configured for Next.js and Node.js 22. Its Ignored Build Step is also set to “Don’t build anything” (`exit 0`). To launch later, restore that setting to Automatic, enable Git deployments in this file, and explicitly trigger the desired deployment, or deploy manually when authorized. Do not run `vercel` or `vercel --prod` until ready to publish.

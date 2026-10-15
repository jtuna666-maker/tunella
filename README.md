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

## Editing

- `app/page.tsx`: landing page, pricing calculator, FAQ, simulated sample call, and demo modal.
- `app/globals.css`: global styles and reduced-motion support.
- `app/layout.tsx`: page title, description, and document language.

The initial landing page was imported from Gemini Canvas. Project configuration, accessibility fixes, and build checks were added afterward.

## Before launch

The demo form currently validates inputs and displays a simulated success state. It does **not** transmit or store requests. Replace the clearly marked endpoint TODO in `handleDemoSubmit` with a real submission handler, including network error handling, before accepting customer requests.

Replace the clearly marked contact email TODO in the footer. The sample call uses a transcript and synthesized audio cues, rather than a recorded call.

## Vercel

Automatic Git deployments are disabled in `vercel.json` through `git.deploymentEnabled: false`. Connecting the repository must not deploy it. To launch later, enable Git deployments and explicitly trigger the desired deployment, or deploy manually when authorized. Do not run `vercel` or `vercel --prod` until ready to publish.

# Job Application Tracker

A lightweight, local-first tracker for your job search. Add applications, auto-populate interviews from role templates, get follow-up reminders after inactivity, and open a clean overlay with prep checklists, resources, and calendar export links.

## Features

- Add, edit, delete applications
- Status lanes: Applied, Interviewing, Offer, Rejected, Accepted
- Role templates that prefill interview stages (SE, PM, Designer, Data, Sales)
- Follow-up queue after N days of inactivity (defaults to 14)
- Full-screen overlay for clear reading, with:
  - Interview prep checklists and resource links per interview type
  - Google / Outlook / Apple Calendar export
- Paste a job URL to auto-fill company/role (LinkedIn/Indeed/Glassdoor patterns)
- Local storage persistence (no backend)
- Clean UI with shadcn/ui + Tailwind + lucide-react

## Tech stack

- React (client component)
- Tailwind CSS
- shadcn/ui
- lucide-react
- LocalStorage (data persistence)

## Quick start

```bash
# clone
git clone <your-repo-url>
cd <your-repo>

# install deps
pnpm install      # or: npm install / yarn

# dev
pnpm dev          # or: npm run dev / yarn dev

# build
pnpm build

# preview
pnpm start

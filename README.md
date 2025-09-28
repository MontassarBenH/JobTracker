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

Requires Node 18+.

Usage

Click Add New Application.

Paste a job URL to auto-fill where possible.

Pick a Role Template to pre-seed interview stages.

Add interview dates and times; export to your calendar.

The Follow-up Queue surfaces apps with no updates for 14+ days. Click Send Follow-up to open an email and auto-stamp lastFollowUp.

LocalStorage keys:

jobApplications

companies

Follow-up logic
needsFollowUp(app, days = 14)
// true if app is not rejected/accepted and
// days since (lastFollowUp || dateApplied) >= days

Calendar export

Google: https://calendar.google.com/calendar/render?action=TEMPLATE...

Outlook: https://outlook.office.com/calendar/0/deeplink/compose?...

Apple: generates and downloads a .ics on the fly.

Licensed under the Apache License, Version 2.0.





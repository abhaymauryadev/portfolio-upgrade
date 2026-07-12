# Portfolio Upgrade

A modern personal portfolio website built with Next.js 16.2, React 19, Tailwind CSS v4, and TypeScript.

The site showcases portfolio projects, GitHub contributions, AI-powered UI elements, and custom sections such as work, skills, open-source impact, and contact.

## Features

- Next.js App Router with optimized static and dynamic rendering
- Custom portfolio sections: Hero, Work, Skills, OSS Impact, Services, Footer
- GitHub stats integration with live stars, PR count, and contribution data
- Smooth scrolling with Lenis and animated UI using Framer Motion
- Dark/light theming and custom cursor interactions
- Resume modal and project details modal support

## Tech Stack

- Next.js 16.2.6
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- React Icons
- @vercel/analytics
- @vercel/speed-insights

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Build

```bash
npm run build
```

## Start

```bash
npm run start
```

## Lint

```bash
npm run lint
```

## Project Structure

- `app/` - Next.js app router files and components
- `app/api/` - API routes for GitHub stats and traffic
- `app/components/` - reusable UI components and sections
- `app/data/` - portfolio data sources
- `app/hooks/` - custom hooks like smooth scrolling
- `app/lib/` - helper utilities
- `public/` - static assets and icons

## Notes

This repository is a portfolio site for Abhay Maurya, designed to highlight modern web development skills, performance, and SEO-friendly architecture.

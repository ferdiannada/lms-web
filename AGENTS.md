# AGENTS.md

You are an expert in JavaScript, TypeScript, React 19, Vite, and modern LMS application development. You write maintainable, performant, and accessible code.

## Framework & Stack
- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4 + Glassmorphism UI
- **Icons**: Lucide React
- **Backend API**: Go (Gin) API Gateway at `http://localhost:8080` (or dynamic `VITE_API_BASE_URL`)

## Commands

- `npm run dev` - Start the Vite dev server
- `npm run build` - Build the React app for production
- `npm run preview` - Preview the production build locally

## Integration
Aligned with `lms-smk` (Flutter app & Go backend):
- Roles: `siswa` (Student), `guru` (Teacher), `admin`
- Modules: Authentication, Dashboard, Classes (Rombel/Virtual), Stream/Forum, Materials, Assignments, Quizzes & Exam Player, Gradebook, Dapodik Sync, Profile & Settings.

# AI Learning Tracker - Frontend (Angular 22)

This directory contains the full **Angular 22** frontend implementation of the AI Learning Tracker platform. It was converted from the original React application with **100% visual and functional parity** (identical design, Tailwind styling, glassmorphism, animations, and microservices/mock API integrations).

> [!NOTE]
> The original React implementation is preserved at [`frontend-react/`](../frontend-react/) so you can study both side-by-side!

---

## 🚀 Quick Start

### Run with the Project Launcher
From the root workspace directory, run:
```bat
run_app.bat
```
or
```bat
start_all.bat
```
Option `[1]` starts all Spring Boot microservices, the Social Image service, and this Angular frontend on `http://localhost:5173`.

### Run Standalone
```bash
cd frontend
npm run dev
# or
npx ng serve --port 5173
```
Open [http://localhost:5173](http://localhost:5173).

### Production Build
```bash
npm run build
```
Generates production-optimized output in `dist/frontend-angular/browser`.

---

## 🧠 React vs Angular 22 Architecture Cheat Sheet

As you learn Angular, use this mapping to see how your React knowledge maps directly to modern Angular:

| Concept | React Implementation (`frontend-react/`) | Angular 22 Implementation (`frontend/`) |
| :--- | :--- | :--- |
| **Component Architecture** | Function components (`const Comp = () => JSX`) | **Standalone Components** (`@Component({ standalone: true })`) |
| **Reactivity / State** | `useState(val)` | **Signals**: `signal(val)` & `computed(() => ...)` |
| **Global State** | Context API (`useContext(AuthContext)`) | **Injectable Services**: `inject(AuthService)` |
| **Conditional Rendering**| `{condition && <Component />}` / Ternaries | Modern Control Flow: `@if (condition) { ... } @else { ... }` |
| **List Rendering** | `{items.map(item => <Item key={item.id} />)}` | Modern Control Flow: `@for (item of items; track item.id) { ... }` |
| **Input Two-Way Binding**| `value={val} onChange={e => setVal(e.target.value)}` | `[(ngModel)]="val"` (with `FormsModule`) |
| **Styling & Design System**| Tailwind CSS + Custom CSS Variables | Identical Tailwind config + `src/styles.css` glassmorphic classes |
| **Icons** | `lucide-react` icons | `<app-icon name="..." [size]="20" />` (pure SVG, ultra fast) |
| **Routing & Navigation** | `react-router-dom` | Angular Router (`RouterModule`, signals synchronization) |

---

## 📁 Project Structure

```text
frontend/src/app/
├── components/
│   ├── chatbot/          # AI Chatbot with Web Speech API speech-to-text
│   ├── glass-card/       # Glassmorphism container with hover effects
│   ├── icon/             # Centralized Lucide SVG icon renderer
│   ├── login/            # Authentication modal (Sign In / Register)
│   ├── navbar/           # Top bar (streak, XP bar, theme switch, notifications)
│   └── sidebar/          # Nav menu with active state tracking
├── pages/
│   ├── dashboard/        # Analytics, SVG trend chart, curriculum progress
│   ├── roadmap/          # Timeline curriculum, prerequisite locking, completion
│   ├── tools-directory/  # AI tools directory, category filter, ratings & search
│   ├── learning-modules/ # Stepper quizzes + 3D perspective flip flashcards
│   ├── profile/          # User stats, 14-week Git-style activity heatmap
│   ├── google-ai-hub/    # Google AI / Gemini / DeepMind tracks & ecosystem
│   ├── social-studio/    # Social post studio & live HTML5 Canvas banner studio
│   ├── settings/         # API key settings, mock/live mode toggle
│   ├── admin-panel/      # Tool management & microservices health
│   └── onboarding/       # 5-step interactive onboarding flow
├── services/
│   ├── auth.service.ts   # User session, JWT token, XP & badge calculation
│   ├── learning.service.ts # Roadmaps, tools, news, quizzes, daily logs
│   └── theme.service.ts  # Dark / Light theme toggle & DOM syncing
├── types/
│   └── index.ts          # Strongly typed domain models (RoadmapNode, Tool, etc.)
└── utils/
    └── mockData.ts       # Mock curriculum, trending tools, and starter data
```

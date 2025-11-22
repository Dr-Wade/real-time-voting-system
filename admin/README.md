# Admin Dashboard

Vue.js admin dashboard for managing polls in the real-time voting system.

## Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Next generation frontend tooling
- **Axios** - HTTP client

## Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Development

The dev server runs on `http://localhost:5173` and proxies API requests to `http://localhost:3333`.

### Features

- Create new polls with multiple options
- Real-time poll management
- Quick stats dashboard
- Responsive design

## API Integration

The dashboard communicates with the backend API at `http://localhost:3333`. Make sure the backend server is running before starting the admin dashboard.

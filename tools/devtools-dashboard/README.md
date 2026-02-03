# DevTools Dashboard

A graphical management dashboard for My-Agent-Configuration skills and tools.

## Features

- **Skills Browser**: Browse and manage all available skills
- **Tools Manager**: Start, stop, and configure installed tools
- **System Status**: Monitor health and performance of all components
- **Quick Actions**: Fast access to frequently used features
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Option 1: Direct HTML (No dependencies)
```bash
# Open the static HTML dashboard
open public/index.html
```

### Option 2: Next.js Development (Full features)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Project Structure

```
devtools-dashboard/
├── public/
│   └── index.html          # Static HTML dashboard
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── theme-provider.tsx # Theme management
│   ├── sidebar-provider.tsx # Sidebar state
│   └── app-sidebar.tsx   # Navigation sidebar
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions
├── types/                # TypeScript types
└── package.json          # Dependencies and scripts
```

## Integration with My-Agent-Configuration

This dashboard integrates with the existing My-Agent-Configuration project:

### Skills Integration
- Reads from `../skills/skills-config.json`
- Displays all available skills
- Provides enable/disable functionality

### Tools Integration
- Scans `../tools/` directory
- Lists all installed tools
- Provides start/stop controls

### Launch Integration
- Can be launched from the main `launch.js` menu
- Runs alongside other tools

## Development

### Prerequisites
- Node.js 18+ and npm
- TypeScript knowledge (for Next.js version)

### Available Scripts
```bash
# Static version
open public/index.html

# Next.js version
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Code linting
npm run type-check # Type checking
```

### Adding New Features
1. Create new components in `components/`
2. Add routes in `app/` directory
3. Update sidebar navigation in `components/app-sidebar.tsx`
4. Test with `npm run dev`

## API Integration

The dashboard can connect to local APIs for real-time data:

```typescript
// Example API endpoints
GET /api/skills          # List all skills
GET /api/tools           # List all tools
POST /api/tools/:id/start # Start a tool
POST /api/tools/:id/stop  # Stop a tool
GET /api/status          # System status
```

## Deployment

### Static Deployment
Simply copy the `public/` directory to any web server.

### Next.js Deployment
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Configuration

Create `.env.local` for environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
SKILLS_CONFIG_PATH=../skills/skills-config.json
TOOLS_DIR_PATH=../tools/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT - See LICENSE file for details.

## Screenshots

![Dashboard](https://via.placeholder.com/800x450/3b82f6/ffffff?text=DevTools+Dashboard+Screenshot)

## Roadmap

- [x] Static HTML dashboard
- [ ] Next.js dynamic dashboard
- [ ] Real-time skills management
- [ ] Tool execution controls
- [ ] Dark/light theme toggle
- [ ] Mobile app version
- [ ] Plugin system
- [ ] Analytics dashboard
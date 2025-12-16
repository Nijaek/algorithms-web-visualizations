# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeonAlgo Lab is a web-based algorithm visualization platform with a React frontend and Django backend. The application provides interactive visualizations for sorting algorithms, pathfinding algorithms, and k-means clustering.

## Development Commands

### Frontend (React + Vite + TypeScript)
Located in `frontend/` directory:

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build (http://localhost:4173)
npm run lint         # Run ESLint
npm test             # Run tests with Vitest
```

### Backend (Django + DRF)
Located in `backend/` directory:

```bash
cd backend
# Create virtual environment if needed
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py runserver  # Start development server (http://localhost:8000)
python manage.py test       # Run tests
```

## Architecture

### Frontend Structure
- **Algorithm Implementations**: `frontend/src/algorithms/` - TypeScript implementations of algorithms (sorting, pathfinding, k-means)
- **Components**:
  - `frontend/src/components/visualizers/` - React components for algorithm visualization
  - `frontend/src/components/controls/` - UI controls for algorithm parameters
  - `frontend/src/components/metrics/` - Performance metrics and complexity display
  - `frontend/src/components/Layout/` - Application layout components
- **Hooks**: `frontend/src/hooks/` - Custom React hooks for visualization logic
- **Types**: `frontend/src/types/` - TypeScript type definitions
- **API Client**: `frontend/src/services/apiClient.ts` - Backend API communication

### Backend Structure
- **API Endpoints**: `backend/api/algorithms/` - Algorithm implementations and API endpoints
- **Django Settings**: `backend/neonalgo/settings.py` - Django configuration
- **Tests**: `backend/api/tests/` - Test suites for algorithm implementations

### Algorithm Categories
The application supports three main algorithm categories:
1. **Sorting**: Merge Sort, Quick Sort, Heap Sort
2. **Pathfinding**: Dijkstra's Algorithm, A* Search
3. **Clustering**: K-Means (Lloyd's algorithm)

## Key Technologies
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Django 5.1+, Django REST Framework
- **Testing**: Vitest (frontend), Django Test Framework (backend)

## Development Notes
- Frontend runs on port 5173 by default
- Backend runs on port 8000 by default
- The application uses a dark theme with cyan accents
- Visualizations include step-by-step algorithm execution with performance metrics
- Each algorithm has associated time/space complexity information displayed in the UI
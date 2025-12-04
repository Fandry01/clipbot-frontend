import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/Toast'
import Root from './pages/Root'
import Overview from './pages/Overview'
import Library from './pages/Library'
import Uploads from './pages/Uploads'
import ProjectClips from './pages/ProjectClips'
import MediaDetail from './pages/MediaDetail'
import ClipEditor from './pages/ClipEditor'
import BrandTemplate from './pages/BrandTemplate'
import LandingPage from './pages/LandingPage'
import './styles.css'
import MeSettings from "./pages/MeSettings";


if (!localStorage.getItem('ownerId')) {
  localStorage.setItem('ownerId', '00000000-0000-0000-0000-000000000001')
}

const router = createBrowserRouter([
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: <Root />,
    children: [
      // redirect van "/" naar overview
      { index: true, element: <Navigate to="/dashboard/overview" replace /> },
      { path: '/dashboard/overview', element: <Overview /> },
      { path: '/dashboard/library', element: <Library /> },
      { path: '/dashboard/uploads', element: <Uploads /> },
      { path: '/dashboard/project/:id', element: <ProjectClips /> },
      { path: '/dashboard/media/:id', element: <MediaDetail /> },
      { path: '/dashboard/clip/:id/edit', element: <ClipEditor /> },
      { path: '/dashboard/brand-template', element: <BrandTemplate /> },
      { path: '/dashboard/me', element: <MeSettings /> },

    ],
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    </ToastProvider>
  </StrictMode>,
)

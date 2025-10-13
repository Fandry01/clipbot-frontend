import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import Overview from './pages/Overview'
import Library from './pages/Library'
import Root from './pages/Root'
import Uploads from './pages/Uploads'
import ProjectClips from './pages/ProjectClips'
import ClipEditor from "./pages/ClipEditor";
import MediaDetail from "./pages/MediaDetail";
import BrandTemplate from "./pages/BrandTemplate";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/dashboard/overview', element: <Overview /> },
      { path: '/dashboard/library', element: <Library /> },
      { path: '/dashboard/uploads', element: <Uploads /> },
      { path: '/dashboard/project/:id', element: <ProjectClips /> },
      { path: '/dashboard/media/:id', element: <MediaDetail /> },
      { path: '/dashboard/clip/:id/edit', element: <ClipEditor /> },
      { path: '/dashboard/brand-template', element: <BrandTemplate /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

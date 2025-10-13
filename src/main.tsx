import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import Overview from './pages/Overview'
import Library from './pages/Library'
import Root from './pages/Root'
import Uploads from './pages/Uploads'
import ProjectClips from './pages/ProjectClips'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/dashboard/overview', element: <Overview /> },
      { path: '/dashboard/library', element: <Library /> },
      { path: '/dashboard/uploads', element: <Uploads /> },
      { path: '/dashboard/project/:id', element: <ProjectClips /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

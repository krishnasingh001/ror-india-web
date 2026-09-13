import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { BlogEditorPage } from '@/pages/BlogEditorPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogShowPage } from '@/pages/BlogShowPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyShowPage } from '@/pages/CompanyShowPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExternalApplicationsPage } from '@/pages/ExternalApplicationsPage'
import { HomePage } from '@/pages/HomePage'
import { JobShowPage } from '@/pages/JobShowPage'
import { MyBlogPostsPage } from '@/pages/MyBlogPostsPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SavedJobsPage } from '@/pages/SavedJobsPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="jobs/:id" element={<JobShowPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/:id" element={<CompanyShowPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route
              path="blog/new"
              element={
                <ProtectedRoute>
                  <BlogEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog/:slug/edit"
              element={
                <ProtectedRoute>
                  <BlogEditorPage />
                </ProtectedRoute>
              }
            />
            <Route path="blog/:slug" element={<BlogShowPage />} />
            <Route
              path="my-blog-posts"
              element={
                <ProtectedRoute>
                  <MyBlogPostsPage />
                </ProtectedRoute>
              }
            />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved-jobs"
              element={
                <ProtectedRoute>
                  <SavedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="track-applications"
              element={
                <ProtectedRoute>
                  <ExternalApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="applications" element={<Navigate to="/track-applications" replace />} />
            <Route path="external-applications" element={<Navigate to="/track-applications" replace />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

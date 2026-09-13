import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AboutPage } from '@/pages/AboutPage'
import { BlogEditorPage } from '@/pages/BlogEditorPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogShowPage } from '@/pages/BlogShowPage'
import { CareersPage } from '@/pages/CareersPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyShowPage } from '@/pages/CompanyShowPage'
import { ContactPage } from '@/pages/ContactPage'
import { CookiePolicyPage } from '@/pages/CookiePolicyPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExternalApplicationsPage } from '@/pages/ExternalApplicationsPage'
import { GdprCompliancePage } from '@/pages/GdprCompliancePage'
import { HomePage } from '@/pages/HomePage'
import { JobShowPage } from '@/pages/JobShowPage'
import { MyBlogPostsPage } from '@/pages/MyBlogPostsPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SavedJobsPage } from '@/pages/SavedJobsPage'
import { ShopPage } from '@/pages/ShopPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { SitemapPage } from '@/pages/SitemapPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'

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
            <Route path="about" element={<AboutPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
            <Route path="cookie-policy" element={<CookiePolicyPage />} />
            <Route path="gdpr-compliance" element={<GdprCompliancePage />} />
            <Route path="sitemap" element={<SitemapPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

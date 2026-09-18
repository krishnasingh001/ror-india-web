import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute, RecruiterRoute, CandidateRoute } from '@/components/ProtectedRoute'
import { RequireBrowseAccess } from '@/components/BrowseGate'
import { AboutPage } from '@/pages/AboutPage'
import { AdminRedirect } from '@/pages/AdminRedirect'
import { AtsResumeCheckerPage } from '@/pages/AtsResumeCheckerPage'
import { BlogEditorPage } from '@/pages/BlogEditorPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogShowPage } from '@/pages/BlogShowPage'
import { CareersPage } from '@/pages/CareersPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyShowPage } from '@/pages/CompanyShowPage'
import { ContactPage } from '@/pages/ContactPage'
import { CookiePolicyPage } from '@/pages/CookiePolicyPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { GdprCompliancePage } from '@/pages/GdprCompliancePage'
import { HomePage } from '@/pages/HomePage'
import { JobShowPage } from '@/pages/JobShowPage'
import { MyBlogPostsPage } from '@/pages/MyBlogPostsPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { JobFormPage } from '@/pages/recruiter/JobFormPage'
import { MyJobsPage } from '@/pages/recruiter/MyJobsPage'
import { CompanyFormPage } from '@/pages/recruiter/CompanyFormPage'
import { RecruiterApplicationsPage } from '@/pages/recruiter/RecruiterApplicationsPage'
import { SavedProfilesPage } from '@/pages/recruiter/SavedProfilesPage'
import { TalentBrowsePage } from '@/pages/recruiter/TalentBrowsePage'
import { TalentProfilePage } from '@/pages/recruiter/TalentProfilePage'
import { RecruiterProfilePage } from '@/pages/recruiter/RecruiterProfilePage'
import { TrackApplicationsRouter } from '@/pages/TrackApplicationsRouter'
import { SavedJobsPage } from '@/pages/SavedJobsPage'
import { ShopPage } from '@/pages/ShopPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ConfirmEmailPage } from '@/pages/ConfirmEmailPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { UnsubscribePage } from '@/pages/UnsubscribePage'
import { SitemapPage } from '@/pages/SitemapPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="admin/*" element={<AdminRedirect />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<HomePage />} />
            <Route
              path="jobs/new"
              element={
                <RecruiterRoute>
                  <JobFormPage />
                </RecruiterRoute>
              }
            />
            <Route
              path="jobs/:id/edit"
              element={
                <RecruiterRoute>
                  <JobFormPage />
                </RecruiterRoute>
              }
            />
            <Route
              path="jobs/:id"
              element={
                <RequireBrowseAccess>
                  <JobShowPage />
                </RequireBrowseAccess>
              }
            />
            <Route
              path="my-jobs"
              element={
                <RecruiterRoute>
                  <MyJobsPage />
                </RecruiterRoute>
              }
            />
            <Route
              path="recruiter/applications"
              element={
                <RecruiterRoute>
                  <RecruiterApplicationsPage />
                </RecruiterRoute>
              }
            />
            <Route
              path="talent"
              element={
                <RecruiterRoute>
                  <TalentBrowsePage />
                </RecruiterRoute>
              }
            />
            <Route
              path="talent/:id"
              element={
                <RecruiterRoute>
                  <TalentProfilePage />
                </RecruiterRoute>
              }
            />
            <Route
              path="saved-profiles"
              element={
                <RecruiterRoute>
                  <SavedProfilesPage />
                </RecruiterRoute>
              }
            />
            <Route
              path="recruiter/profile"
              element={
                <RecruiterRoute>
                  <RecruiterProfilePage />
                </RecruiterRoute>
              }
            />
            <Route
              path="companies/new"
              element={
                <RecruiterRoute>
                  <CompanyFormPage />
                </RecruiterRoute>
              }
            />
            <Route path="companies" element={<CompaniesPage />} />
            <Route
              path="companies/:id"
              element={
                <RequireBrowseAccess>
                  <CompanyShowPage />
                </RequireBrowseAccess>
              }
            />
            <Route path="blog" element={<BlogPage />} />
            <Route path="tools/ats-resume-checker" element={<AtsResumeCheckerPage />} />
            <Route path="ats-resume-checker" element={<Navigate to="/tools/ats-resume-checker" replace />} />
            <Route
              path="blog/new"
              element={
                <CandidateRoute>
                  <BlogEditorPage />
                </CandidateRoute>
              }
            />
            <Route
              path="blog/:slug/edit"
              element={
                <CandidateRoute>
                  <BlogEditorPage />
                </CandidateRoute>
              }
            />
            <Route path="blog/:slug" element={<BlogShowPage />} />
            <Route
              path="my-blog-posts"
              element={
                <CandidateRoute>
                  <MyBlogPostsPage />
                </CandidateRoute>
              }
            />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="users/confirmation" element={<ConfirmEmailPage />} />
            <Route path="confirm-email" element={<ConfirmEmailPage />} />
            <Route path="users/password/edit" element={<ResetPasswordPage />} />
            <Route path="unsubscribe" element={<UnsubscribePage />} />
            <Route path="unsubscribe/:token" element={<UnsubscribePage />} />
            <Route path="profile/new" element={<Navigate to="/profile/edit" replace />} />
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
                <CandidateRoute>
                  <SavedJobsPage />
                </CandidateRoute>
              }
            />
            <Route path="track-applications" element={<TrackApplicationsRouter />} />
            <Route path="applications" element={<Navigate to="/track-applications" replace />} />
            <Route path="external-applications" element={<Navigate to="/track-applications" replace />} />
            <Route path="recruiter" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="profile"
              element={
                <CandidateRoute>
                  <ProfilePage />
                </CandidateRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <CandidateRoute>
                  <ProfileEditPage />
                </CandidateRoute>
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

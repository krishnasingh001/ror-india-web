import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyShowPage } from '@/pages/CompanyShowPage'
import { HomePage } from '@/pages/HomePage'
import { JobShowPage } from '@/pages/JobShowPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs/:id" element={<JobShowPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:id" element={<CompanyShowPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

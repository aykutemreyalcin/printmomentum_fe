import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { FeedPage } from './pages/FeedPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="listings/:listingId" element={<ListingDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

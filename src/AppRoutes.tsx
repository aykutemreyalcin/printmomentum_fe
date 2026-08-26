import { Route, Routes } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { FavoritesPage } from './pages/FavoritesPage'
import { FeedPage } from './pages/FeedPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ShopPage } from './pages/ShopPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="auth/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<FeedPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="listings/:listingId" element={<ListingDetailPage />} />
          <Route path="shops/:shopId" element={<ShopPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

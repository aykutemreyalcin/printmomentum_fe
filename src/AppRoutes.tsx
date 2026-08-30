import { Route, Routes } from 'react-router'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { ChartsPage } from './pages/ChartsPage'
import { CreateUserPage } from './pages/CreateUserPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { FeedPage } from './pages/FeedPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { LoginPage } from './pages/LoginPage'
import { MembersPage } from './pages/MembersPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { NicheDetailPage } from './pages/NicheDetailPage'
import { NicheWindowsPage } from './pages/NicheWindowsPage'
import { ShopPage } from './pages/ShopPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="auth/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<FeedPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="niches" element={<NicheWindowsPage />} />
          <Route path="niches/:slug" element={<NicheDetailPage />} />
          <Route path="listings/:listingId" element={<ListingDetailPage />} />
          <Route path="shops/:shopId" element={<ShopPage />} />
          <Route path="account/security/change-password" element={<ChangePasswordPage />} />
          <Route path="account/profile" element={<ProfilePage />} />
          <Route element={<RequireAdmin />}>
            <Route path="account/members" element={<MembersPage />} />
            <Route path="account/members/register-user" element={<CreateUserPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import PublicAdminRoute from "@/components/admin/PublicAdminRoute";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CategoryPromptProvider } from "@/context/CategoryPromptContext";
import { SizeProvider } from "@/context/SizeContext";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin-routes";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SearchResultsPage = lazy(() => import("@/pages/SearchResultsPage"));
const SeoArticlePage = lazy(() => import("@/pages/SeoArticlePage"));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const AppShell = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
            Cargando Soccer Style...
          </div>
        }
      >
        <Routes>
          <Route element={<PublicAdminRoute />}>
            <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
          </Route>

          <Route element={<ProtectedAdminRoute />}>
            <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
          </Route>

          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/buscar" element={<SearchResultsPage />} />
            <Route path="/implementos-futbol-ecuador" element={<Navigate replace to="/contacto" />} />
            <Route path="/zapatos-futbol-riobamba" element={<Navigate replace to="/contacto" />} />
            <Route path="/zapatos-futbol-latacunga" element={<Navigate replace to="/contacto" />} />
            <Route path="/blog/:slug" element={<SeoArticlePage />} />
            <Route path="/pupillos" element={<Navigate replace to="/pupillos-futbol" />} />
            <Route path="/accesorios" element={<Navigate replace to="/accesorios-futbol" />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/:slug" element={<CategoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CatalogProvider>
        <CategoryPromptProvider>
          <SizeProvider>
            <AppShell />
          </SizeProvider>
        </CategoryPromptProvider>
      </CatalogProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

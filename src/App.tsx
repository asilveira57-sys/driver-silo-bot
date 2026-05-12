import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrintersPage from "./pages/PrintersPage";
import PrinterDetailPage from "./pages/PrinterDetailPage";
import DriversPage from "./pages/DriversPage";
import DriverDetailPage from "./pages/DriverDetailPage";
import SoftwaresPage from "./pages/SoftwaresPage";
import SoftwareDetailPage from "./pages/SoftwareDetailPage";
import TutorialsPage from "./pages/TutorialsPage";
import TutorialDetailPage from "./pages/TutorialDetailPage";
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetailPage from "./pages/MaterialDetailPage";
import DownloadsPage from "./pages/DownloadsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import QuemSomosPage from "./pages/QuemSomosPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import CookiesPage from "./pages/CookiesPage";
import TermosPage from "./pages/TermosPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminPrinters from "./pages/admin/AdminPrinters";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminSoftwares from "./pages/admin/AdminSoftwares";
import AdminTutorials from "./pages/admin/AdminTutorials";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminSEO from "./pages/admin/AdminSEO";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/impressoras" element={<PrintersPage />} />
            <Route path="/impressoras/:marca" element={<PrintersPage />} />
            <Route path="/impressoras/:marca/:modelo" element={<PrinterDetailPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/:modelo" element={<DriverDetailPage />} />
            <Route path="/softwares" element={<SoftwaresPage />} />
            <Route path="/softwares/:nome" element={<SoftwareDetailPage />} />
            <Route path="/tutoriais" element={<TutorialsPage />} />
            <Route path="/tutoriais/:slug" element={<TutorialDetailPage />} />
            <Route path="/materiais" element={<MaterialsPage />} />
            <Route path="/materiais/:slug" element={<MaterialDetailPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
            <Route path="/quem-somos" element={<QuemSomosPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacidadePage />} />
            <Route path="/politica-de-cookies" element={<CookiesPage />} />
            <Route path="/termos-e-condicoes" element={<TermosPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminHome />} />
              <Route path="impressoras" element={<AdminPrinters />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="softwares" element={<AdminSoftwares />} />
              <Route path="tutoriais" element={<AdminTutorials />} />
              <Route path="materiais" element={<AdminMaterials />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="seo" element={<AdminSEO />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const Home = lazy(() => import('../pages/home/page'));
const Properties = lazy(() => import('../pages/properties/page'));
const About = lazy(() => import('../pages/about/page'));
const FAQPage = lazy(() => import('../pages/faq/page'));
const Contact = lazy(() => import('../pages/contact/page'));
const PropertyDetail = lazy(() => import('../pages/property-detail/page'));
const Login = lazy(() => import('../pages/login/page'));
const AdminDashboard = lazy(() => import('../pages/admin/dashboard/page'));
const AddProperty = lazy(() => import('../pages/add-property/page'));
const AgentsPage = lazy(() => import('../pages/admin/agents/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const TratamientoDatos = lazy(() => import('../pages/tratamiento-datos/page'));
const PoliticaReembolso = lazy(() => import('../pages/politica-reembolso/page'));

// Componente de redirección para rutas antiguas /inmuebles/:id
const PropertyRedirect = lazy(() => import('../pages/property-detail/PropertyRedirect'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/inmuebles',
    element: <Properties />,
  },
  // Ruta antigua - Redirección de /inmuebles/:id a la nueva URL con slug
  {
    path: '/inmuebles/:id',
    element: <PropertyRedirect />,
  },
  // Rutas SEO-friendly por operación
  {
    path: '/venta/:slug',
    element: <PropertyDetail />,
  },
  {
    path: '/arriendo/:slug',
    element: <PropertyDetail />,
  },
  {
    path: '/renta-corta/:slug',
    element: <PropertyDetail />,
  },
  // Rutas alternativas con el valor exacto de la base de datos
  {
    path: '/arriendo-tradicional/:slug',
    element: <PropertyDetail />,
  },
  {
    path: '/arriendo-renta-corta/:slug',
    element: <PropertyDetail />,
  },
  {
    path: '/nosotros',
    element: <About />,
  },
  {
    path: '/faq',
    element: <FAQPage />,
  },
  {
    path: '/contacto',
    element: <Contact />,
  },
  {
    path: '/add-property',
    element: <AddProperty />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/agents',
    element: (
      <ProtectedRoute>
        <AgentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tratamiento-datos',
    element: <TratamientoDatos />,
  },
  {
    path: '/politica-reembolso',
    element: <PoliticaReembolso />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
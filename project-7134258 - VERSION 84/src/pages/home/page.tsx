import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import FeaturedProperties from './components/FeaturedProperties';
import GallerySection from './components/GallerySection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent />
      <HeroSection />
      <FeaturedProperties />
      <GallerySection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
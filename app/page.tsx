import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import FeaturedMeals from './components/landing/FeaturedMeals';
import Features from './components/landing/Features';
import Impact from './components/landing/Impact';
import Testimonials from './components/landing/Testimonials';
import CTA from './components/landing/CTA';
import Footer from './components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedMeals />
        <Features />
        <Impact />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

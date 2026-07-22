import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import WhyBuildFlow from '@/components/WhyBuildFlow';
import Features from '@/components/Features';
import AIWorkflows from '@/components/AIWorkflows';
import ProjectPlanning from '@/components/ProjectPlanning';
import TaskManagement from '@/components/TaskManagement';
import Collaboration from '@/components/Collaboration';
import Roadmaps from '@/components/Roadmaps';
import Analytics from '@/components/Analytics';
import Integrations from '@/components/Integrations';
import Security from '@/components/Security';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <WhyBuildFlow />
        <Features />
        <AIWorkflows />
        <ProjectPlanning />
        <TaskManagement />
        <Collaboration />
        <Roadmaps />
        <Analytics />
        <Integrations />
        <Security />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;

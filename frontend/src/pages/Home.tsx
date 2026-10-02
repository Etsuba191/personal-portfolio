import Hero from '../components/Home/Hero'
import Services from '../components/Home/Services'
import LatestProjects from '../components/Home/LatestProjects'
import AboutSection from '../components/Home/AboutSection'
import Skills from '../components/Home/Skills'
import Process from '../components/Home/Process'
import Testimonials from '../components/Home/Testimonials'
import FAQ from '../components/Home/FAQ'
import ContactSection from '../components/Home/ContactSection'
import Certificates from '../components/Home/Certificates'
import Experience from '../components/Home/Experience'
import Education from '../components/Home/Education'

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <LatestProjects />
      <AboutSection />
      <Experience />
      <Education />
      <Skills />
      <Certificates />
      <Process />
      <Testimonials />
      <FAQ />
      <ContactSection />
    </>
  )
}

export default Home
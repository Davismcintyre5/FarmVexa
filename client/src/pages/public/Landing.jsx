import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import Downloads from './Downloads';
import About from './About';
import Help from './Help';
import Contact from './Contact';
import FAQ from './FAQ';
import CTA from './CTA';
import MarketPreview from './MarketPreview';

export default function Landing() {
    return (
        <div>
            <Hero />
            <Features />
            <HowItWorks />
            <MarketPreview />
            <Pricing />
            <Downloads />
            <About />
            <Help />
            <Contact />
            <FAQ />
            <CTA />
        </div>
    );
}
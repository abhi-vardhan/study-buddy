import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Drawer } from '@progress/kendo-react-layout';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? "bg-white/80 backdrop-blur-md shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-studyBuddy-primary" />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-studyBuddy-primary to-studyBuddy-secondary">
                StudyBuddy
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/80 hover:text-studyBuddy-primary transition-colors">
              Home
            </Link>
            <Button
              fillMode="flat"
              onClick={() => scrollToSection('features')}
              className="text-foreground/80 hover:text-studyBuddy-primary transition-colors"
            >
              Features
            </Button>
            <Button
              fillMode="flat"
              onClick={() => scrollToSection('upload-section')}
              className="text-foreground/80 hover:text-studyBuddy-primary transition-colors"
            >
              Try It
            </Button>
            <Button
              themeColor="primary"
              onClick={() => scrollToSection('upload-section')}
              className="rounded-full px-6"
            >
              Get Started
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button
            icon={mobileMenuOpen ? 'k-i-close' : 'k-i-menu'}
            fillMode="flat"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && ( // Conditional rendering based on mobileMenuOpen
        <Drawer
          expanded={mobileMenuOpen}
          position="start"
          mode="overlay"
          onSelect={(e) => {
            const selectedItem = e.itemTarget.props.text;
            if (selectedItem === 'Home') scrollToSection('home');
            if (selectedItem === 'Features') scrollToSection('features');
            if (selectedItem === 'Try It') scrollToSection('upload-section');
            setMobileMenuOpen(false);
          }}
          items={[
            { text: 'Home' },
            { text: 'Features' },
            { text: 'Try It' },
          ]}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/"
              className="block py-2 text-foreground/90 hover:text-studyBuddy-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Button
              fillMode="flat"
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-foreground/90 hover:text-studyBuddy-primary"
            >
              Features
            </Button>
            <Button
              fillMode="flat"
              onClick={() => scrollToSection('upload-section')}
              className="block w-full text-left py-2 text-foreground/90 hover:text-studyBuddy-primary"
            >
              Try It
            </Button>
            <Button
              themeColor="primary"
              onClick={() => scrollToSection('upload-section')}
              className="w-full rounded-full"
            >
              Get Started
            </Button>
          </div>
        </Drawer>
      )}
    </header>
  );
};

export default Header;
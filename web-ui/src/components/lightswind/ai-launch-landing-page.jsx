import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, ArrowRight, Zap, Brain, Cpu, Network, Bot, AtomIcon } from "lucide-react";
import { motion } from "framer-motion";
import BeamCircle from "@/components/ui/beam-circle";
import { Button } from "@/components/ui/button";

const Page01 = () => {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Content constants
  const SITE_CONFIG = {
    logo: "AIX",
    logoHighlight: "X"
  };

  const NAVIGATION_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "#blog" }
  ];

  const HEADER_CTA = {
    signIn: { label: "Sign in", href: "#signin" },
    getStarted: { label: "Get Started", href: "#get-started" }
  };

  const HERO_CONTENT = {
    title: {
      line1: "Introducing AIX",
      line2: "The Future of Artificial Intelligence"
    },
    description: "Revolutionize your business with AI-driven solutions that deliver results faster than ever. AIX empowers you to innovate, automate, and scale with cutting-edge technology.",
    cta: {
      primary: { label: "Try AIX Now", href: "#try-now" },
      secondary: { label: "Learn More", href: "#learn-more" }
    }
  };

  // Beam Circle Orbits Configuration
  const beamOrbits = useMemo(() => [
    {
      id: 1,
      radiusFactor: 0.25,
      speed: 10,
      icon: <Brain className="text-background" />,
      iconSize: 32,
      orbitThickness: 1.5,
    },
    {
      id: 2,
      radiusFactor: 0.45,
      speed: 15,
      icon: <Cpu className="text-background" />,
      iconSize: 36,
      orbitThickness: 1.5,
    },
    {
      id: 3,
      radiusFactor: 0.65,
      speed: 12,
      icon: <Network className="text-background" />,
      iconSize: 40,
      orbitThickness: 2,
    },
    {
      id: 4,
      radiusFactor: 0.85,
      speed: 18,
      icon: <Zap className="text-background" />,
      iconSize: 36,
      orbitThickness: 1.5,
    },
    {
      id: 5,
      radiusFactor: 1.05,
      speed: 20,
      icon: <Bot className="text-background" />,
      iconSize: 32,
      orbitThickness: 1,
    },
  ], []);

  // Center icon for BeamCircle
  const centerIcon = useMemo(() => (
    <AtomIcon className="text-background" size={40} strokeWidth={2} />
  ), []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden px-4">
      {/* Header */}
      <header className="fixed w-full top-0 left-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-8 h-16 max-w-7xl">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center font-semibold text-xl gap-1 tracking-tight hover:opacity-80 transition-opacity"
            aria-label={SITE_CONFIG.logo + " Logo"}
          >
            <AtomIcon className="text-foreground" size={26} />
            {SITE_CONFIG.logo.slice(0, -1)}
            <span className="text-gray-900 dark:text-white">
              {SITE_CONFIG.logoHighlight}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAVIGATION_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                className="px-3 h-9 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-md"
                asChild
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors h-9"
              asChild
            >
              <a href={HEADER_CTA.signIn.href}>{HEADER_CTA.signIn.label}</a>
            </Button>
            <Button
              className="h-10 px-6 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              asChild
            >
              <a href={HEADER_CTA.getStarted.href}>{HEADER_CTA.getStarted.label}</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={24} strokeWidth={2} />
            ) : (
              <Menu size={24} strokeWidth={2} />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={"fixed inset-0 z-40 bg-background md:hidden transform transition-transform duration-300 ease-out " + (isMobileMenuOpen ? "translate-x-0" : "translate-x-full")}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <nav className="flex flex-col space-y-1">
            {NAVIGATION_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                className="justify-start px-4 h-12 text-base font-medium text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
                onClick={toggleMobileMenu}
                asChild
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-foreground/20 space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-center h-12 text-base font-medium text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors border-none"
              onClick={toggleMobileMenu}
              asChild
            >
              <a href={HEADER_CTA.signIn.href}>{HEADER_CTA.signIn.label}</a>
            </Button>
            <Button
              className="w-full h-12 rounded-lg bg-black dark:bg-white dark:text-black text-white text-base font-medium hover:opacity-90 transition-opacity border-none"
              onClick={toggleMobileMenu}
              asChild
            >
              <a href={HEADER_CTA.getStarted.href}>{HEADER_CTA.getStarted.label}</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
                <span className="block text-gray-900 dark:text-white">
                  {HERO_CONTENT.title.line1}
                </span>
                <span className="block text-gray-600 dark:text-gray-400 mt-2">
                  {HERO_CONTENT.title.line2}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {HERO_CONTENT.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  className="h-14 px-8 text-base font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity shadow-2xl"
                  asChild
                >
                  <a href={HERO_CONTENT.cta.primary.href}>
                    {HERO_CONTENT.cta.primary.label}
                    <ArrowRight size={16} className="ml-2" strokeWidth={2} />
                  </a>
                </Button>
                <Button
                  variant="neutral"
                  className="h-14 px-8 text-base font-medium text-foreground/70 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  asChild
                >
                  <a href={HERO_CONTENT.cta.secondary.href}>{HERO_CONTENT.cta.secondary.label}</a>
                </Button>
              </div>
            </div>

            {/* Right Content - BeamCircle Component */}
            <div className="relative flex items-center justify-center overflow-hidden">
              {/* BeamCircle Component - Responsive Scaling */}
              <div className="relative z-10 scale-50 sm:scale-75 md:scale-90 lg:scale-100">
                <BeamCircle
                  size={500}
                  orbits={beamOrbits}
                  centerIcon={centerIcon}
                />

                {/* Additional Glow Effect 1 */}
                <motion.div
                  className="absolute bottom-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 blur-2xl pointer-events-none"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                {/* Additional Glow Effect 2 */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 blur-2xl pointer-events-none"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page01;

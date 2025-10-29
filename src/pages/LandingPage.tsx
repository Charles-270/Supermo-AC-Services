/**
 * Landing Page - Redesigned with Google Stitch Design
 * Public homepage with login/register options
 */

import { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { MaterialIcon } from '@/components/ui/material-icon';

import { PlatformDropdown } from '@/components/navigation/PlatformDropdown';


import { motion } from 'framer-motion';
import type { UserRole } from '@/types/user';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Lazy load AuthDialog - only loads when user clicks login/register
const AuthDialog = lazy(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })));

export function LandingPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [scrollY, setScrollY] = useState(0);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(`/dashboard/${profile.role}`);
    }
  }, [user, profile, navigate]);

  const openAuthDialog = (tab: 'login' | 'register', role?: UserRole) => {
    setAuthDialogTab(tab);
    setSelectedRole(role);
    setAuthDialogOpen(true);
  };

  const handlePlatformSelect = (role: UserRole) => {
    openAuthDialog('register', role);
  };



  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display scroll-smooth">
      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm transition-all duration-300 ${scrollY > 50 ? 'shadow-md' : ''
          }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <MaterialIcon icon="ac_unit" className="text-primary" size="lg" />
            </motion.div>
            <h1 className="text-xl font-bold text-text-light dark:text-text-dark">
              Supremo AC Services
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#services" className="hover:text-primary transition-colors text-base leading-none">Services</a>
            <a href="#products" className="hover:text-primary transition-colors text-base leading-none">Products</a>
            <a href="#training" className="hover:text-primary transition-colors text-base leading-none">Training</a>
            <PlatformDropdown onSelectPlatform={handlePlatformSelect} />
            <a href="#about" className="hover:text-primary transition-colors text-base leading-none">About</a>
          </nav>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openAuthDialog('login')}
              className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center space-x-2"
            >
              <MaterialIcon icon="login" size="sm" />
              <span>Log In</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 md:pt-32">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center md:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
              >
                <MaterialIcon icon="ac_unit" className="mr-1" size="sm" />
                <span className="text-primary font-medium">Professional HVAC Services</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-text-light dark:text-text-dark leading-tight mb-4"
              >
                Modern HVAC{' '}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Solutions
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg mb-8 text-gray-600 dark:text-gray-400"
              >
                Leading provider of air conditioning solutions. From installation to maintenance,
                product sales to professional training - all accessible through our comprehensive digital platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => openAuthDialog('register')}
                    className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2 group"
                  >
                    <MaterialIcon icon="call" size="sm" />
                    <span>Get Started</span>
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <MaterialIcon icon="arrow_forward" size="sm" />
                    </motion.span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => openAuthDialog('login')}
                    className="bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark px-8 py-3 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <MaterialIcon icon="event" size="sm" />
                    <span>Book Online</span>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                alt="Technician working on an AC unit"
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
                fetchPriority="high"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKWnWWgjBpYFLcoI_7E9x_0WIGqoFi0ni--b-y_xQKzk8zn0wYWpn7eM1r3l0-IDARamwPfQemc8XXMa486Z605cswAv763Nt0Twx54qJlfmWAwpsPe9cKESSKrLFsXML53MU1wnYZjHb67qXnBJweqBjzdADMVjBJBJH4zhtm_Vc1sHwy_3mZxz86c8KB8YAr0cGMK_GFMYF2cmjnt8ODcq6q7sWJiA314KdZI6CgS-htBL5x17rJ2b62bz7hlVsNmny6bqgOmTs"
              />
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20" id="services">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
              >
                <span className="text-primary font-medium">Services</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-text-light dark:text-text-dark mb-2"
              >
                Our Services
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Comprehensive air conditioning solutions from installation to training.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark h-full group relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                  <CardHeader className="pb-4 relative">
                    <MaterialIcon icon="ac_unit" className="text-primary mb-4" size="xl" />
                    <CardTitle className="font-bold text-xl mb-2">A/C Installation</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      Professional installation of new air conditioning systems.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                      Learn More
                      <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        →
                      </motion.span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark h-full group relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                  <CardHeader className="pb-4 relative">
                    <MaterialIcon icon="build" className="text-primary mb-4" size="xl" />
                    <CardTitle className="font-bold text-xl mb-2">Repairs & Maintenance</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      Prompt repair and preventative maintenance plans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                      Learn More
                      <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        →
                      </motion.span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark h-full group relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                  <CardHeader className="pb-4 relative">
                    <MaterialIcon icon="shopping_cart" className="text-primary mb-4" size="xl" />
                    <CardTitle className="font-bold text-xl mb-2">A/C Products & Parts</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      Quality AC units, parts, and supplies for sale.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                      Learn More
                      <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        →
                      </motion.span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark h-full group relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                  <CardHeader className="pb-4 relative">
                    <MaterialIcon icon="school" className="text-primary mb-4" size="xl" />
                    <CardTitle className="font-bold text-xl mb-2">Training & Apprenticeship</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      Hands-on HVAC training and job placement programs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                      Learn More
                      <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        →
                      </motion.span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20" id="products">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
              >
                <span className="text-primary font-medium">Products</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-text-light dark:text-text-dark mb-2"
              >
                Featured Products
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Our best air conditioning units and genuine spare parts.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden border border-border-light dark:border-border-dark group">
                  <div className="overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      alt="Split AC Unit"
                      className="w-full h-56 object-cover"
                      loading="lazy"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdrfYfv36AxlRTsYbA-qapoGmxr3AfbHTY-EVEx8q7V_FMTGb_rgtLqzdMdxFuaxb-DsgtsJx3MxKUHkqUk0xl1RQW4eT42rCwgTiTq5sAmkPIlMnXNL7VIHJhs1YMzRAOwsq88vZqWDim0MeAlc51F8brl1Adyu7wDY8WsCyMDgK1sKrSSlyIbpnoWRRW2_CH3WG9SAfgSLc6Hhl2_tb3ExUWClEitfsoAm-stxl4rmI4E22dnKh6I8wlLAQcxgdrKRaCjI7WP1U"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="font-bold text-xl">Premium Split AC Unit</CardTitle>
                      <div className="flex items-center text-yellow-500">
                        <MaterialIcon icon="star" size="sm" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <p className="text-primary font-semibold text-lg mb-4">GHS 2,500</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-primary text-white py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2">
                        <MaterialIcon icon="add_shopping_cart" size="sm" />
                        <span>Add to Cart</span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden border border-border-light dark:border-border-dark group">
                  <div className="overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      alt="Industrial HVAC System"
                      className="w-full h-56 object-cover"
                      loading="lazy"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfaD3xPA5bVTfZKOPVepZRNis15XIu1wB88pbVI58dgEkIMYqSEVNfcdY5xlyKTs5fLwOPfHtaFwk_nR9LNXUf7TgixwbRqmPjrvx4wDNBxn8Myh7hVe06og9PM66GSXjMay3vSAXIHkddT25Rovf2slq1jNHVGLmTwROYpr-OXGEyBbTz56oFdmJ-mnLax6T19m8uYY6L0SeJrJL6dTkVy_dNi4m68d2O3sb_Z70ijh6du5lwvR5tloHI0O-sMuPjilgARjlrg9A"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="font-bold text-xl">Industrial HVAC System</CardTitle>
                      <div className="flex items-center text-yellow-500">
                        <MaterialIcon icon="star" size="sm" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <p className="text-primary font-semibold text-lg mb-4">GHS 10,000</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-primary text-white py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2">
                        <MaterialIcon icon="add_shopping_cart" size="sm" />
                        <span>Add to Cart</span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden border border-border-light dark:border-border-dark group">
                  <div className="overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      alt="AC Compressor"
                      className="w-full h-56 object-cover"
                      loading="lazy"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCiegYj_csx4X4vXRxrnU3yEE1rXrXtR4VXZO8b7Ii5bGKVhLGr3NGlVvLqfDQRPwFzQn0DNYQgcZRGDTFyBvskV5VPnKO-N5S4OeExFtOykoLmbJ8T_GgvXdBUzt7IvqvKO2IIoJVXjAp2GUmpg99QRpjMGGIiewo7ccXLbf2X5LO2n4YbNuQwsjIlazdcZh-rKSV6JPkRguCwUHkmMEVaQhH-y0GnUcFQPY5Oo7Fg_1pcQ6etHK_1StrKRoM8HcUGwEBnCwGfKQ"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="font-bold text-xl">AC Compressor</CardTitle>
                      <div className="flex items-center text-yellow-500">
                        <MaterialIcon icon="star" size="sm" />
                        <span>4.7</span>
                      </div>
                    </div>
                    <p className="text-primary font-semibold text-lg mb-4">GHS 800</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-primary text-white py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2">
                        <MaterialIcon icon="add_shopping_cart" size="sm" />
                        <span>Add to Cart</span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Training Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800" id="training">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
              >
                <span className="text-primary font-medium">Training</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-text-light dark:text-text-dark mb-2"
              >
                Professional Training
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Comprehensive HVAC unit training and apprenticeship programs with digital learning portal.
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  alt="Technicians in a training session"
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvtzK6SJz-bQL9-48IBKjr4juv_1A4bfkxvqrRUkTmBuQT1tn-7zenIjVXRMMgnC7WPyyEvsWsKCoJflBacc2XwqlFcvonvIuGZG0_AOHLOOy2l_bfNCnD8A1ictV9mjkxH127LVoNIfHkVO9hAnqaN-gX11tcZhRbF3Um4s5sdgPvFFjnbrRcTyJ8E_NHvRS6Txf8yRsBvuwNXRwYqEBYX0eMF6jchO_7Zaf4z33HJ5N3-a5LHEFemCBfNehWnl1k9in2zCjgwwM"
                />
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-8"
              >
                <motion.div
                  variants={itemFadeIn}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark group relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <CardHeader className="relative">
                      <CardTitle className="font-bold text-xl mb-2">Online Learning Portal</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                        Access training modules, videos, and interactive courseware from anywhere.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                        Join & Learn
                        <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                          →
                        </motion.span>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={itemFadeIn}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark group relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <CardHeader className="relative">
                      <CardTitle className="font-bold text-xl mb-2">Hands-on Training</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                        Practical workshops and apprenticeship programs with certified professionals.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <a href="#" className="font-semibold text-primary hover:underline inline-flex items-center gap-2">
                        Check schedule & Visit
                        <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                          →
                        </motion.span>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
              >
                <span className="text-primary font-medium">Testimonials</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-text-light dark:text-text-dark mb-2"
              >
                What Our Customers Say
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Don't just take our word for it. Here's what our satisfied customers across have to say.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark">
                  <CardHeader>
                    <div className="flex text-yellow-500 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <MaterialIcon key={i} icon="star" size="sm" />
                      ))}
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      "Supremo AC installed our new central air system last month. The team was professional,
                      punctual, and the installation was flawless. Our home has never been cooler!"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">Barbara Johnson</p>
                    <p className="text-sm text-gray-500">Homeowner</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg border border-border-light dark:border-border-dark">
                  <CardHeader>
                    <div className="flex text-yellow-500 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <MaterialIcon key={i} icon="star" size="sm" />
                      ))}
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      "When our AC broke down during the peak of the dry season, Supremo's team came to our rescue
                      within hours. Excellent emergency service and very reasonable pricing."
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">Fatima Haruna</p>
                    <p className="text-sm text-gray-500">Business Owner</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Us Section */}
        <section
          className="py-20"
          id="about"
          aria-labelledby="about-heading"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="max-w-5xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-border-light dark:border-border-dark p-6 sm:p-10 lg:p-14 bg-card-light dark:bg-card-dark shadow-lg"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <span className="inline-block text-xs uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                    About Us
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  id="about-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-light dark:text-text-dark leading-tight mb-8"
                >
                  Our Story
                </motion.h2>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="max-w-3xl space-y-6"
                >
                  <motion.p
                    variants={itemFadeIn}
                    className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400"
                  >
                    Founded in Ghana, Supremo AC Services is a trusted HVAC partner for homes, offices, and industrial facilities.
                    We install, service, repair, uninstall, and refill AC systems with the precision of certified technicians and
                    the care of a local team that shows up on time and does it right the first time.
                  </motion.p>

                  <motion.p
                    variants={itemFadeIn}
                    className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400"
                  >
                    Our approach blends smart diagnostics, clean workmanship, and transparent pricing. From new installations and
                    gas refills to preventive servicing and emergency call-outs, we tailor solutions to fit your space, your budget,
                    and your schedule.
                  </motion.p>

                  <motion.p
                    variants={itemFadeIn}
                    className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400"
                  >
                    What sets us apart is consistency: clear communication, safety-first procedures, and documented quality checks
                    on every job. That's how we keep clients comfortable, energy-efficient, and productive all year round.
                  </motion.p>

                  <motion.p
                    variants={itemFadeIn}
                    className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Our mission: create reliably cool, healthy indoor environments through superior air-conditioning solutions—delivered
                    with integrity and technical excellence.
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Contact/Booking Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800" id="booking">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm mb-4"
                >
                  <span className="text-primary font-medium">Contact</span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold text-text-light dark:text-text-dark mb-4"
                >
                  Ready to Book a Service?
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-lg text-gray-600 dark:text-gray-400 mb-8"
                >
                  Get started with our online booking system. Schedule installations, repairs, or maintenance at your convenience.
                </motion.p>

                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  alt="Customer service representative"
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvBZJ_gn1Tffy5HiRCpSX73sFKLOtO7JTk1vlPC4x7oZ2HkFolbathvxujDN2ekanu-dHQN-ccrOpx_xwA-QRRpJX4Y5JlI9q0Yf_FSQnDCBwDA0dZUp1vUZxaoxEBOKmKP_KoRfTga_7hhwHxSXXB_USk42H9gKQvFKj5p7g5Sih6wyt5ZZINXh4RSHabbscYiNxS8u625ZzcKfA7OPWyaJbZV8W92B_6qAQjWX0_Fq9j30ileSXNYL7fljS7iThjDRSM15iRLYo"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-2xl border border-border-light dark:border-border-dark">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-2 text-center">Get in Touch</CardTitle>
                    <CardDescription className="text-center text-sm">
                      Send us a message and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="contact-name" className="block mb-2 font-medium">Full Name</label>
                        <input
                          className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-gray-700 focus:ring-primary focus:border-primary"
                          id="contact-name"
                          name="name"
                          placeholder="Enter your full name"
                          type="text"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block mb-2 font-medium">Email Address</label>
                        <input
                          className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-gray-700 focus:ring-primary focus:border-primary"
                          id="contact-email"
                          name="email"
                          placeholder="Enter your email"
                          type="email"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="block mb-2 font-medium">Phone Number</label>
                        <input
                          className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-gray-700 focus:ring-primary focus:border-primary"
                          id="contact-phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          type="tel"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-message" className="block mb-2 font-medium">Message</label>
                        <textarea
                          className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-gray-700 focus:ring-primary focus:border-primary"
                          id="contact-message"
                          name="message"
                          placeholder="Describe your service needs..."
                          rows={4}
                          required
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>Send Message</span>
                          <MaterialIcon icon="send" size="sm" />
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h5 className="mb-4 text-lg font-bold">Supremo AC Services</h5>
              <p className="text-gray-400">
                Leading provider of air conditioning solutions. Your comfort is our business.
              </p>
            </div>
            <div>
              <h5 className="mb-4 text-lg font-bold">Services</h5>
              <ul className="space-y-2">
                <li><a className="text-gray-400 hover:text-white" href="#services">A/C Installation</a></li>
                <li><a className="text-gray-400 hover:text-white" href="#services">Repairs & Maintenance</a></li>
                <li><a className="text-gray-400 hover:text-white" href="#products">A/C Products</a></li>
                <li><a className="text-gray-400 hover:text-white" href="#training">Training</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-lg font-bold">Platform</h5>
              <ul className="space-y-2">
                <li>
                  <button
                    className="text-left text-gray-400 transition-colors hover:text-white"
                    onClick={() => openAuthDialog('register', 'customer')}
                  >
                    Customer Portal
                  </button>
                </li>
                <li>
                  <button
                    className="text-left text-gray-400 transition-colors hover:text-white"
                    onClick={() => openAuthDialog('register', 'technician')}
                  >
                    Technician Portal
                  </button>
                </li>
                <li>
                  <button
                    className="text-left text-gray-400 transition-colors hover:text-white"
                    onClick={() => openAuthDialog('register', 'supplier')}
                  >
                    Supplier Portal
                  </button>
                </li>
                <li>
                  <button
                    className="text-left text-gray-400 transition-colors hover:text-white"
                    onClick={() => openAuthDialog('register', 'trainee')}
                  >
                    Trainee Portal
                  </button>
                </li>
                <li>
                  <button
                    className="text-left text-gray-400 transition-colors hover:text-white"
                    onClick={() => openAuthDialog('register', 'admin')}
                  >
                    Admin Portal
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-lg font-bold">Contact Us</h5>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <MaterialIcon icon="phone" className="text-primary" size="sm" />
                  <span>+233 54 288 7095</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MaterialIcon icon="email" className="text-primary" size="sm" />
                  <span>supremoaryee@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MaterialIcon icon="location_on" className="text-primary" size="sm" />
                  <span>Accra, Ghana</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500">
            <p>© 2024 Supremo AC Services. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog - Lazy loaded only when opened */}
      {authDialogOpen && (
        <Suspense fallback={null}>
          <AuthDialog
            open={authDialogOpen}
            onOpenChange={setAuthDialogOpen}
            defaultTab={authDialogTab}
            defaultRole={selectedRole}
          />
        </Suspense>
      )}
    </div>
  );
}

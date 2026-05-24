/* js/main.js */
// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Mobile menu
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menu-overlay');
  const closeMenu = document.getElementById('closeMenu');
  
  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
    
    // Close menu when clicking on a link
    const menuLinks = menuOverlay.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close on outside click
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// Intersection Observer for reveal animations
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  revealElements.forEach(el => observer.observe(el));
  
  // Stagger parent
  const staggerParents = document.querySelectorAll('.stagger-parent');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  staggerParents.forEach(el => staggerObserver.observe(el));
}

// Counter animation
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + (el.getAttribute('data-suffix') || '');
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current) + (el.getAttribute('data-suffix') || '');
          }
        }, 20);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Set current year in footer
function setCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Page load fade-in
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  initMobileMenu();
  initRevealAnimations();
  initCounters();
  initSmoothScroll();
  setCurrentYear();
});

// Prefers reduced motion check
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition', 'none');
}
const init = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  if (window.gsap) {
    gsap.set('.hero-title', { opacity: 0, y: 40 });
    gsap.set('.hero-tagline', { opacity: 0, y: 40 });
    gsap.set('.hero-ctas', { opacity: 0, y: 40 });
    gsap.set('.hero-kicker', { opacity: 0, y: 20 });

    gsap
      .timeline({ defaults: { duration: 0.9, ease: 'power3.out' } })
      .to('.hero-kicker', { opacity: 1, y: 0 })
      .to('.hero-title', { opacity: 1, y: 0 }, '-=0.45')
      .to('.hero-tagline', { opacity: 1, y: 0 }, '-=0.35')
      .to('.hero-ctas', { opacity: 1, y: 0 }, '-=0.3');
  }

  const beatCards = document.querySelectorAll('.beat-card');
  beatCards.forEach(card => {
    card.addEventListener('mousemove', event => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) * 12) - 6;
      const rotateX = 6 - ((y / bounds.height) * 12);
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', event => {
      event.preventDefault();
      document.querySelector(backToTop.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
  }
};

document.addEventListener('DOMContentLoaded', init);

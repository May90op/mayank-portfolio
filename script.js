// Interactive effects and smooth interactions
document.addEventListener('DOMContentLoaded', () => {
  // Reveal animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section, .hero-content').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
});

window.addEventListener('load', () => {
  document.querySelectorAll('.section, .hero-content').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});

document.querySelectorAll('.faq-q').forEach((q) => {
  q.addEventListener('click', () => {
    q.parentElement?.classList.toggle('open');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll('.card, .hero').forEach((el) => observer.observe(el));

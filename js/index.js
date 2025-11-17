(function () {
  /**
   * Vanilla, accessible accordion
   * - Uses buttons with aria-expanded/aria-controls
   * - Panels are role="region" and labelled by their trigger
   * - Supports single-open (default) or multi-open via data-allow-multiple="true"
   * - Animates height while respecting prefers-reduced-motion
   */

  const accordions = document.querySelectorAll(".accordion");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastScroll = 0;
  const header = document.getElementById('pageHeader');
  

//Header
window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll && currentScroll > 65) {
        // scrolling down -> hide
        header.classList.add('hidden');
      } else {
        // scrolling up -> show
        header.classList.remove('hidden');
      }

      lastScroll = currentScroll;
    });

  // Accordion
  accordions.forEach((acc) => {
    const allowMultiple = acc.getAttribute("data-allow-multiple") === "true";
    const triggers = acc.querySelectorAll(".accordion__trigger");

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => toggle(btn, acc, allowMultiple));
      // Keyboard niceties: Up/Down to move focus between headers
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const list = Array.from(triggers);
          const idx = list.indexOf(btn);
          const nextIdx = e.key === "ArrowDown" ? (idx + 1) % list.length : (idx - 1 + list.length) % list.length;
          list[nextIdx].focus();
        }
      });
    });
  });

  function toggle(button, root, allowMultiple) {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const panelId = button.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (!allowMultiple && !expanded) {
      // Close others
      const openButtons = root.querySelectorAll('.accordion__trigger[aria-expanded="true"]');
      openButtons.forEach((b) => collapse(b, document.getElementById(b.getAttribute("aria-controls"))));
    }

    expanded ? collapse(button, panel) : expand(button, panel);
  }

  function expand(button, panel) {
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;

    if (prefersReduced) {
      panel.style.blockSize = "auto";
      return;
    }

    // Animate: from 0 to content height
    const contentHeight = panel.scrollHeight;
    panel.style.blockSize = "0px";
    // Force style calc
    panel.getBoundingClientRect();
    panel.style.blockSize = contentHeight + "px";

    const onEnd = (e) => {
      if (e.propertyName !== "block-size") return;
      panel.style.blockSize = "auto";
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }

  function collapse(button, panel) {
    button.setAttribute("aria-expanded", "false");

    if (prefersReduced) {
      panel.hidden = true;
      panel.style.blockSize = "0px";
      return;
    }

    // From current height to 0
    const contentHeight = panel.scrollHeight;
    panel.style.blockSize = contentHeight + "px";
    // Force style calc
    panel.getBoundingClientRect();
    panel.style.blockSize = "0px";

    const onEnd = (e) => {
      if (e.propertyName !== "block-size") return;
      panel.hidden = true;
      panel.removeEventListener("transitionend", onEnd);
    };
    panel.addEventListener("transitionend", onEnd);
  }
})();

// Smart Links with Offset and Smooth Scroll
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    const offset = 100; // distance above section
    const y = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// Carousel Behavior
(() => {
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function initNfCarousel(root) {
    const carousel = root;
    const track = carousel.querySelector('.nf-carousel__track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.nf-carousel__control--prev');
    const nextBtn = carousel.querySelector('.nf-carousel__control--next');
    const dotsWrap = carousel.querySelector('.nf-carousel__dots');
    const viewport = carousel.querySelector('.nf-carousel__viewport');

    let index = 0;

    // Build dots
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'nf-carousel__dot';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Go to slide ${i+1}`);
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);

    function updateUI() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }
    function goTo(i) { index = clamp(i, 0, slides.length - 1); updateUI(); }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    updateUI(); 

    // Keyboard support
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });



    // Optional: swipe support
    function addSwipe(el, onSwipeLeft, onSwipeRight) {
      let startX = 0, isDown = false;
      const threshold = 30;
      el.addEventListener('pointerdown', (e) => { isDown = true; startX = e.clientX; });
      el.addEventListener('pointerup', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (dx > threshold) onSwipeRight();
        if (dx < -threshold) onSwipeLeft();
        isDown = false;
      });
      el.addEventListener('pointerleave', () => { isDown = false; });
    }
    addSwipe(viewport, () => goTo(index + 1), () => goTo(index - 1));

    // Init
    updateUI();

    // Public API (optional)
    return { next: () => goTo(index + 1), prev: () => goTo(index - 1), goTo };
  }

  // Auto-init any [data-carousel] on the page
  document.querySelectorAll('[data-carousel]').forEach(initNfCarousel);
})();

// Footer Behavior
let lastScroll = 0;
const footer = document.getElementById('pageFooter');
const footerToggle = document.getElementById('footerToggle');
const chevron = footerToggle.querySelector('i');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll < lastScroll && currentScroll > 100) {
    footer.classList.remove('hidden');
    chevron.classList.add('rotated'); 
  } else {
    footer.classList.add('hidden');
    chevron.classList.remove('rotated'); 
  }

  lastScroll = currentScroll;
});

footerToggle.addEventListener('click', () => {
  footer.classList.toggle('hidden');
  footerToggle.querySelector('i').classList.toggle('rotated');
});
(function() {

  /* ── Mobile Drawer ── */
  const hamburger = document.getElementById('hamburger');
  const hamIcon   = document.getElementById('hamIcon');
  const drawer    = document.getElementById('drawer');
  const overlay   = document.getElementById('overlay');
  const closeBtn  = document.getElementById('closeBtn');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    hamIcon.className = 'bi bi-x-lg';
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    hamIcon.className = 'bi bi-list';
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
  }
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);

  /* ── Review Carousel ── */
  (function() {
    const track    = document.getElementById('reviewTrack');
    const dotsWrap = document.getElementById('reviewDots');
    const prevBtn  = document.getElementById('reviewPrev');
    const nextBtn  = document.getElementById('reviewNext');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let autoTimer = null;
    let visibleCount = getVisible();
    const total = cards.length;

    function getVisible() {
      return window.innerWidth < 576 ? 1 : window.innerWidth < 992 ? 2 : 3;
    }

    function buildDots() {
      visibleCount = getVisible();
      dotsWrap.innerHTML = '';
      const pages = total - visibleCount + 1;
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('span');
        d.className = 'review-dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => { goTo(i); resetAuto(); });
        dotsWrap.appendChild(d);
      }
    }

    function goTo(index) {
      visibleCount = getVisible();
      const pages = total - visibleCount + 1;
      current = Math.max(0, Math.min(index, pages - 1));
      const cardW = cards[0].offsetWidth + 20;
      track.scrollTo({ left: cardW * current, behavior: 'smooth' });
      dotsWrap.querySelectorAll('.review-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1 < total - visibleCount + 1 ? current + 1 : 0); }
    function prev() { goTo(current > 0 ? current - 1 : total - visibleCount); }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 3500);
    }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }

    prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    nextBtn.addEventListener('click', () => { next(); resetAuto(); });

    track.addEventListener('scroll', () => {
      const cardW = cards[0].offsetWidth + 20;
      current = Math.round(track.scrollLeft / cardW);
      dotsWrap.querySelectorAll('.review-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    });

    track.addEventListener('touchstart', () => clearInterval(autoTimer));
    track.addEventListener('touchend', startAuto);

    window.addEventListener('resize', () => { buildDots(); goTo(0); });

    buildDots();
    startAuto();
  })();

  /* ── Inventory Carousel ── */
  (function() {
    let currentSlide = 0;
    let autoPlayTimer = null;
    let isDragging = false;
    let dragStartX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const wrapper = document.getElementById('carouselWrapper');
    const dots    = document.querySelectorAll('.dot');
    if (!wrapper || !dots.length) return;

    const cards   = wrapper.querySelectorAll('.project-card');
    const total   = cards.length;

    function isMobile() { return window.innerWidth <= 991; }

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function goToSlide(index) {
      currentSlide = ((index % total) + total) % total;
      const cardWidth = cards[0].offsetWidth + 16;
      wrapper.scrollTo({ left: cardWidth * currentSlide, behavior: 'smooth' });
      updateDots();
    }

    window.slideCarousel = function(dir) { goToSlide(currentSlide + dir); resetAutoPlay(); };
    window.goToSlide = goToSlide;

    wrapper.addEventListener('scroll', () => {
      const cardWidth = cards[0].offsetWidth + 16;
      currentSlide = Math.round(wrapper.scrollLeft / cardWidth);
      updateDots();
    });

    wrapper.addEventListener('mousedown', (e) => {
      isDragging  = true;
      hasDragged  = false;
      dragStartX  = e.pageX;
      scrollStart = wrapper.scrollLeft;
      wrapper.style.cursor = 'grabbing';
      wrapper.style.userSelect = 'none';
      clearInterval(autoPlayTimer);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const delta = dragStartX - e.pageX;
      if (Math.abs(delta) > 5) hasDragged = true;
      wrapper.scrollLeft = scrollStart + delta;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.cursor = '';
      wrapper.style.userSelect = '';
      const cardWidth = cards[0].offsetWidth + 16;
      currentSlide = Math.round(wrapper.scrollLeft / cardWidth);
      goToSlide(currentSlide);
      startAutoPlay();
      if (hasDragged) e.stopPropagation();
    });

    wrapper.addEventListener('touchstart', () => clearInterval(autoPlayTimer), { passive: true });
    wrapper.addEventListener('touchend', startAutoPlay, { passive: true });

    function startAutoPlay() {
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 3000);
    }
    function resetAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }

    function toggleControls() {
      document.querySelectorAll('.carousel-arrow, .carousel-dots').forEach(el => {
        el.style.display = isMobile() ? '' : 'none';
      });
    }

    toggleControls();
    window.addEventListener('resize', toggleControls);
    startAutoPlay();
  })();

  /* ── Active Section Tracking ── */
  (function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      const href = btn.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
    });

    const anchorBtns = document.querySelectorAll('.nav-btn[href^="#"]');
    if (!anchorBtns.length) return;

    const sectionMap = new Map();
    anchorBtns.forEach(btn => {
      const id = btn.getAttribute('href').slice(1);
      if (id) sectionMap.set(id, btn);
    });

    const observer = new IntersectionObserver(entries => {
      let anyVisible = false;
      entries.forEach(entry => {
        const btn = sectionMap.get(entry.target.id);
        if (!btn) return;
        if (entry.isIntersecting) {
          anchorBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          anyVisible = true;
        }
      });
      if (!anyVisible) {
        anchorBtns.forEach(b => b.classList.remove('active'));
      }
    }, { rootMargin: '-30% 0px -30% 0px' });

    sectionMap.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  })();

  /* ── Sticky Navigation ── */
  const mainNav = document.querySelector('.main-nav');
  const mobileBar = document.querySelector('.mobile-topbar');
  const desktopLogos = document.querySelectorAll('.nav-logo-img, .drawer-logo-img');
  const mobileLogo = document.querySelector('.mobile-topbar-logo');

  const LOGO_DESKTOP_DEFAULT = '/images/logo.png';
  const LOGO_DESKTOP_SCROLLED = '/images/logo-nav.png';
  const LOGO_MOBILE_DEFAULT = '/images/logo-nav-light.png';
  const LOGO_MOBILE_SCROLLED = '/images/logo-nav-dark.png';

  function toggleNavScroll() {
    const threshold = 50;
    const scrolled = window.scrollY > threshold;
    if (mainNav) mainNav.classList.toggle('navbar-scrolled', scrolled);
    if (mobileBar) mobileBar.classList.toggle('navbar-scrolled', scrolled);
    desktopLogos.forEach(img => {
      img.src = scrolled ? LOGO_DESKTOP_SCROLLED : LOGO_DESKTOP_DEFAULT;
    });
    if (mobileLogo) {
      mobileLogo.src = scrolled ? LOGO_MOBILE_SCROLLED : LOGO_MOBILE_DEFAULT;
    }
  }

  window.addEventListener('scroll', toggleNavScroll);
  toggleNavScroll();

  /* ── Form Submission ── */
  document.querySelectorAll('#appointmentForm, #mobileAppointmentForm').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const fd = new FormData(this);
        const data = Object.fromEntries(fd.entries());
        const res = await fetch(this.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          // Try to update the step indicator above the form
          const header = this.previousElementSibling;
          if (header && header.classList.contains('d-flex')) {
            const step1 = header.querySelector('.bg-accent');
            if (step1) {
              step1.classList.remove('bg-accent', 'text-dark');
              step1.classList.add('bg-secondary', 'text-white');
              step1.parentElement.classList.remove('text-accent');
              step1.parentElement.classList.add('text-white');
              step1.parentElement.style.opacity = '0.7';
            }
            // The second step span has bg-secondary text-white
            const step2Wrap = header.children[2];
            if (step2Wrap) {
              const step2 = step2Wrap.querySelector('span');
              if (step2) {
                step2.classList.remove('bg-secondary', 'text-white');
                step2.classList.add('bg-accent', 'text-dark');
              }
              step2Wrap.classList.remove('text-white');
              step2Wrap.classList.add('text-accent');
              step2Wrap.style.opacity = '1';
            }
          }
          
          this.innerHTML = `
            <div style="text-align:center;padding:24px 10px;">
              <p style="color:rgba(255,255,255,0.9);margin:0;font-size:1.15rem;font-weight:bold;">
                Please Call Us (231) 313-8117 To Make Payment
              </p>
            </div>
          `;
        } else {
          alert('Failed to send. Please try again or call (231) 313-8117.');
        }
      } catch (err) {
        alert('Network error. Please try again or call (231) 313-8117.');
      } finally {
        if (this.querySelector('button[type="submit"]')) {
          btn.disabled = false;
          btn.textContent = orig;
        }
      }
    });
  });

})();

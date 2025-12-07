(() => {
  const mainSelector = '.site-main';

  const isExternal = (href) =>
    /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
  const isHash = (href) => href.startsWith('#');
  const isHtmlLink = (href) => href.endsWith('.html');

  const updateActiveLinks = (filename) => {
    const links = document.querySelectorAll('.site-nav a, .spine-list a');
    links.forEach((link) => {
      const linkFile = (link.getAttribute('href') || '').split('/').pop();
      link.classList.toggle('active', linkFile === filename);
    });
  };

  const navigate = async (href, pushState = true) => {
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error('Fetch failed');

      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');

      const newMain = doc.querySelector(mainSelector);
      const currentMain = document.querySelector(mainSelector);

      if (!newMain || !currentMain) {
        throw new Error('Missing containers');
      }

      // Fade out current main content
      currentMain.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      currentMain.style.opacity = '0';
      currentMain.style.transform = 'translateY(10px)';

      setTimeout(() => {
        currentMain.innerHTML = newMain.innerHTML;
        document.title = doc.title;

        const filename = href.split('/').pop();
        updateActiveLinks(filename);

        currentMain.style.opacity = '1';
        currentMain.style.transform = 'translateY(0)';
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 300);

      if (pushState) {
        history.pushState({ href }, '', href);
      }
    } catch (err) {
      // Fallback to full navigation if anything fails
      window.location.href = href;
    }
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (isExternal(href) || isHash(href)) return;
    if (!isHtmlLink(href)) return;

    e.preventDefault();
    navigate(href, true);
  });

  window.addEventListener('popstate', (e) => {
    const href = (e.state && e.state.href) ? e.state.href : window.location.pathname.split('/').pop();
    navigate(href, false);
  });

  // Initial active link highlight
  updateActiveLinks(window.location.pathname.split('/').pop());
})();


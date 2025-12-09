(() => {
  const mainSelector = '.site-main';

  // Helper to check if a URL is local to this site
  const isLocal = (url) => {
    return url.origin === window.location.origin;
  };

  const isHtmlLink = (url) => {
    // Allow .html files or root path (which serves index.html)
    return url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  };

  const updateActiveLinks = (path) => {
    const links = document.querySelectorAll('.site-nav a, .spine-list a');
    links.forEach((link) => {
      // Use pathname comparison for robustness
      try {
        const linkUrl = new URL(link.href);
        const linkPath = linkUrl.pathname;
        
        // Normalize paths for comparison (handle / vs /index.html)
        const normalize = (p) => p.endsWith('/') ? p + 'index.html' : p;
        const currentPath = normalize(path.startsWith('/') ? path : '/' + path);
        const targetPath = normalize(linkPath);

        // Simple filename check as fallback/alternative matching style
        const linkFile = linkPath.split('/').pop();
        const currentFile = path.split('/').pop();

        // Check for exact match or filename match
        const isActive = targetPath === currentPath || (linkFile && linkFile === currentFile);
        link.classList.toggle('active', isActive);
      } catch (e) {
        // Ignore invalid links
      }
    });
  };

  const navigate = async (fullUrl, pushState = true) => {
    try {
      const res = await fetch(fullUrl);
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

        // Parse the target URL to update links and analytics
        const urlObj = new URL(fullUrl);
        updateActiveLinks(urlObj.pathname);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Fade in
        currentMain.style.opacity = '1';
        currentMain.style.transform = 'translateY(0)';

        // 1. Update History State
        // We do this AFTER the title update so that if GA4 automatic tracking is on,
        // it captures the correct new title instead of the old one.
        if (pushState) {
          history.pushState({ href: fullUrl }, '', fullUrl);
        }

        // 2. Track Pageview Manually
        // This ensures the view is counted even if automatic history tracking misses it,
        // and guarantees the correct title/path are sent.
        // NOTE: For best accuracy (avoiding double counts), disable 
        // "Page changes based on browser history events" in your GA4 Enhanced Measurement settings.
        if (typeof gtag === 'function') {
           gtag('event', 'page_view', {
             page_title: doc.title,
             page_location: fullUrl,
             page_path: urlObj.pathname
           });
        }
      }, 300);

    } catch (err) {
      console.error('Navigation error:', err);
      // Fallback to full navigation
      window.location.href = fullUrl;
    }
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const link = e.target.closest('a');
    if (!link || !link.href) return;

    // Use URL object for robust parsing
    const url = new URL(link.href);

    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (!isLocal(url)) return; // External link
    if (url.hash && url.pathname === window.location.pathname) return; // Hash link on same page
    if (!isHtmlLink(url)) return; // Not an HTML page

    e.preventDefault();
    navigate(url.href, true);
  });

  window.addEventListener('popstate', (e) => {
    // If we have state with href, use it. Otherwise, fallback to current location.
    // Using window.location.href handles the back button correctly.
    const href = (e.state && e.state.href) ? e.state.href : window.location.href;
    navigate(href, false);
  });

  // Initialize: Set the initial state so we can go back to it reliably.
  if (!history.state) {
    history.replaceState({ href: window.location.href }, '', window.location.href);
  }

  // Set active link on load
  updateActiveLinks(window.location.pathname);
})();

// About Section - Read More / Read Less toggle
function toggleAboutText() {
  const expandable = document.getElementById('about-expandable');
  const btn = document.getElementById('about-read-more-btn');

  expandable.classList.toggle('show');
  btn.classList.toggle('active');

  if (expandable.classList.contains('show')) {
    btn.innerHTML = 'Read Less <i class="fa-solid fa-chevron-down"></i>';
  } else {
    btn.innerHTML = 'Read More <i class="fa-solid fa-chevron-down"></i>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar scroll behavior
  const navbar = document.querySelector('.navbar-custom');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  // Run once on load to handle mid-page refreshes
  handleScroll();

  // 2. Before/After Sliders Interaction
  const sliders = document.querySelectorAll('.slider-container');
  
  sliders.forEach(slider => {
    const handle = slider.querySelector('.slider-handle');
    const afterContainer = slider.querySelector('.after-image-container');
    let isDragging = false;
    
    const moveSlider = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      
      // Keep percentage between 0% and 100%
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      
      handle.style.left = `${percentage}%`;
      afterContainer.style.width = `${percentage}%`;
      
      const afterImg = afterContainer.querySelector('img');
      if (afterImg) {
        afterImg.style.width = `${rect.width}px`;
      }
    };
    
    // Mouse Events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });
    
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      moveSlider(e.clientX);
    });
    
    // Touch Events for Mobile
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
    }, { passive: true });
    
    window.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        moveSlider(e.touches[0].clientX);
      }
    });

    // Allow clicking anywhere on the slider container to move the slider
    slider.addEventListener('click', (e) => {
      // Don't trigger click move if we were dragging
      if (e.target === handle || isDragging) return;
      moveSlider(e.clientX);
    });
  });

  // Init slider image widths on load and resize
  const initSliders = () => {
    sliders.forEach(slider => {
      const rect = slider.getBoundingClientRect();
      const afterImg = slider.querySelector('.after-image-container img');
      if (afterImg) {
        afterImg.style.width = `${rect.width}px`;
      }
    });
  };
  
  window.addEventListener('resize', initSliders);
  window.addEventListener('load', initSliders);
  initSliders();


  // 3. Stats Counter Animation
  const statsSection = document.querySelector('.why-us-section');
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const startCounters = () => {
    statNumbers.forEach(stat => {
      const targetText = stat.getAttribute('data-target');
      const hasPlus = targetText.includes('+');
      const hasStar = targetText.includes('★');
      
      // Extract numeric value
      let numString = targetText.replace(/[^0-9.]/g, '');
      const targetVal = parseFloat(numString);
      const isDecimal = targetVal % 1 !== 0;
      
      let currentVal = 0;
      const duration = 1500; // ms
      const steps = 60;
      const increment = targetVal / steps;
      const stepDuration = duration / steps;
      
      const counterInterval = setInterval(() => {
        currentVal += increment;
        if (currentVal >= targetVal) {
          currentVal = targetVal;
          clearInterval(counterInterval);
        }
        
        // Format the output
        let formattedVal = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);
        
        if (hasStar) {
          stat.textContent = `${formattedVal}★`;
        } else if (hasPlus) {
          stat.textContent = `${formattedVal}+`;
        } else {
          stat.textContent = formattedVal;
        }
      }, stepDuration);
    });
  };

  // IntersectionObserver to trigger counter on scroll
  if ('IntersectionObserver' in window && statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          startCounters();
          animated = true;
          observer.unobserve(statsSection);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
  } else {
    // Fallback if IntersectionObserver is not supported
    startCounters();
  }

  // 4. Scroll Reveal Animations
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('appear');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };
  
  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });
  
  // Initial check on page load
  setTimeout(handleScrollAnimation, 300);

  // 5. Contact Form Submission (Web3Forms AJAX)
  const contactForm = document.getElementById('contact-form');
  const formResult = document.getElementById('form-result');
  const formSubmitBtn = document.getElementById('form-submit');
  const submitText = formSubmitBtn ? formSubmitBtn.querySelector('.submit-text') : null;
  const spinner = formSubmitBtn ? formSubmitBtn.querySelector('.spinner-border') : null;
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN = 30000; // 30 seconds between submissions

  // Simple sanitizer to strip HTML/script tags
  const sanitizeInput = (str) => str.replace(/<[^>]*>/g, '').trim();

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Check validation
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }

      // Rate limiting - prevent rapid submissions
      const now = Date.now();
      if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
        const waitSecs = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
        if (formResult) {
          formResult.className = 'error';
          formResult.textContent = `Please wait ${waitSecs} seconds before submitting again.`;
        }
        return;
      }

      // Show loading state
      formSubmitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Sending...';
      if (spinner) spinner.classList.remove('d-none');
      
      // Hide previous result
      if (formResult) {
        formResult.className = 'd-none';
        formResult.textContent = '';
      }

      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);

      // Sanitize user inputs
      if (object.name) object.name = sanitizeInput(object.name);
      if (object.email) object.email = sanitizeInput(object.email);
      if (object.phone) object.phone = sanitizeInput(object.phone);
      if (object.message) object.message = sanitizeInput(object.message);

      const json = JSON.stringify(object);
      lastSubmitTime = Date.now();

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let res = {};
        try {
          res = await response.json();
        } catch (err) {
          console.warn('Contact form response did not contain JSON', err);
        }

        if (response.ok) {
          if (formResult) {
            formResult.className = 'success';
            formResult.textContent = 'Success! Your message has been sent successfully.';
          }
          contactForm.reset();
          contactForm.classList.remove('was-validated');
        } else {
          console.log('Web3Forms submit error', response.status, res);
          if (formResult) {
            formResult.className = 'error';
            formResult.textContent = res.message || 'Error! Something went wrong. Please try again.';
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (formResult) {
          formResult.className = 'error';
          formResult.textContent = 'Error! Network error or server unreachable. Please try again.';
        }
      })
      .then(() => {
        // Reset loading state
        formSubmitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Send Message';
        if (spinner) spinner.classList.add('d-none');
      });
    });
  }

  // 6. Swiper initialization for Customer Reviews Carousel
  if (typeof Swiper !== 'undefined') {
    new Swiper('.reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        // when window width is >= 768px (tablet)
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        // when window width is >= 1024px (desktop)
        1024: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      }
    });
  }

  // 7. Read More / Read Less for long review texts
  const reviewTexts = document.querySelectorAll('.review-text');

  reviewTexts.forEach(textEl => {
    // Create the toggle button
    const btn = document.createElement('button');
    btn.className = 'review-read-more';
    btn.textContent = 'Read More';
    btn.setAttribute('aria-expanded', 'false');

    // Insert button after the review text
    textEl.insertAdjacentElement('afterend', btn);

    // Check if text is actually truncated (after a small delay for rendering)
    const checkTruncation = () => {
      if (textEl.scrollHeight > textEl.clientHeight + 2) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    // Run check after fonts and layout settle
    setTimeout(checkTruncation, 200);
    window.addEventListener('resize', checkTruncation);

    // Toggle behavior
    btn.addEventListener('click', () => {
      const isExpanded = textEl.classList.toggle('expanded');
      btn.textContent = isExpanded ? 'Read Less' : 'Read More';
      btn.setAttribute('aria-expanded', isExpanded);
    });
  });
});

/**
 * Sparkling Clean Co. — script.js
 *
 * Features:
 *  - Mobile navigation toggle (hamburger menu)
 *  - Sticky header shadow on scroll
 *  - Active nav link highlighting
 *  - Contact form client-side validation
 *  - Footer copyright year
 */

(function () {
  "use strict";

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Returns the first element matching the selector, or null.
   * @param {string} selector
   * @param {Document|Element} [context=document]
   * @returns {Element|null}
   */
  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  /**
   * Returns all elements matching the selector as an array.
   * @param {string} selector
   * @param {Document|Element} [context=document]
   * @returns {Element[]}
   */
  function qsa(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  // ── Mobile Navigation ────────────────────────────────────────────────────

  (function initNav() {
    const toggle = qs("#navToggle");
    const menu = qs("#navMenu");

    if (!toggle || !menu) {
      return;
    }

    function openMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      const firstLink = qs("a, button", menu);
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener("click", toggleMenu);

    qsa(".nav__link", menu).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      const isInsideNav = toggle.contains(event.target) || menu.contains(event.target);
      if (!isInsideNav && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    const mediaQuery = window.matchMedia("(min-width: 641px)");
    mediaQuery.addEventListener("change", function (event) {
      if (event.matches) {
        closeMenu();
      }
    });
  })();

  // ── Sticky Header Shadow ──────────────────────────────────────────────────

  (function initStickyHeader() {
    const header = qs(".site-header");
    if (!header) {
      return;
    }

    function updateHeader() {
      if (window.scrollY > 10) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  })();

  // ── Active Nav Link on Scroll ─────────────────────────────────────────────

  (function initActiveLinks() {
    const sections = qsa("main > section[id]");
    const navLinks = qsa(".nav__link[href^='#']");

    if (!sections.length || !navLinks.length) {
      return;
    }

    const headerHeight =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
        10
      ) || 64;

    function onScroll() {
      let current = "";
      const scrollY = window.scrollY + headerHeight + 20;

      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) {
          current = section.id;
        }
      });

      navLinks.forEach(function (link) {
        const href = link.getAttribute("href").slice(1);
        if (href === current) {
          link.setAttribute("aria-current", "page");
          link.style.color = "var(--color-primary)";
        } else {
          link.removeAttribute("aria-current");
          link.style.color = "";
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  // ── Contact Form Validation ───────────────────────────────────────────────

  (function initContactForm() {
    const form = qs("#contactForm");
    if (!form) {
      return;
    }

    const fields = {
      name: {
        input: qs("#name"),
        error: qs("#nameError"),
        validate: function (value) {
          if (!value.trim()) {
            return "Please enter your full name.";
          }
          if (value.trim().length < 2) {
            return "Name must be at least 2 characters.";
          }
          return "";
        },
      },
      email: {
        input: qs("#email"),
        error: qs("#emailError"),
        validate: function (value) {
          if (!value.trim()) {
            return "Please enter your email address.";
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
            return "Please enter a valid email address.";
          }
          return "";
        },
      },
      message: {
        input: qs("#message"),
        error: qs("#messageError"),
        validate: function (value) {
          if (!value.trim()) {
            return "Please enter a message.";
          }
          if (value.trim().length < 10) {
            return "Message must be at least 10 characters.";
          }
          return "";
        },
      },
    };

    function showError(field, message) {
      field.input.classList.add("is-invalid");
      field.input.setAttribute("aria-invalid", "true");
      field.error.textContent = message;
    }

    function clearError(field) {
      field.input.classList.remove("is-invalid");
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
    }

    function validateAll() {
      let isValid = true;
      Object.values(fields).forEach(function (field) {
        const message = field.validate(field.input.value);
        if (message) {
          showError(field, message);
          isValid = false;
        } else {
          clearError(field);
        }
      });
      return isValid;
    }

    Object.values(fields).forEach(function (field) {
      field.input.addEventListener("blur", function () {
        const message = field.validate(field.input.value);
        if (message) {
          showError(field, message);
        } else {
          clearError(field);
        }
      });

      field.input.addEventListener("input", function () {
        if (field.input.classList.contains("is-invalid")) {
          const message = field.validate(field.input.value);
          if (!message) {
            clearError(field);
          }
        }
      });
    });

    const submitBtn = qs("#submitBtn");
    const successMsg = qs("#formSuccess");

    /**
     * Shows an inline submission error inside the form.
     * @param {string} message
     */
    function showSubmitError(message) {
      let errorEl = qs("#submitError", form);
      if (!errorEl) {
        errorEl = document.createElement("p");
        errorEl.id = "submitError";
        errorEl.setAttribute("role", "alert");
        errorEl.style.cssText =
          "color:var(--color-error);font-size:var(--text-sm);font-weight:500;text-align:center;";
        submitBtn.insertAdjacentElement("afterend", errorEl);
      }
      errorEl.textContent = message;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!validateAll()) {
        const firstInvalid = qs(".is-invalid", form);
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending\u2026";

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          if (successMsg) {
            successMsg.hidden = false;
            successMsg.focus();
          }
        } else {
          throw new Error("Server responded with status " + response.status);
        }
      } catch (err) {
        showSubmitError(
          "Sorry, something went wrong. Please call us directly or try again later."
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });
  })();

  // ── Footer Year ───────────────────────────────────────────────────────────

  (function initYear() {
    const yearEl = qs("#year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  })();
})();

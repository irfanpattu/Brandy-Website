
// BRANDY Formspree configuration
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeaawjqq";

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const menuButton = document.querySelector(".menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const year = document.getElementById("year");

    if (year) year.textContent = new Date().getFullYear();

    // Sticky header
    const onScroll = () => {
        header?.classList.toggle("scrolled", window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile navigation
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", () => {
            const open = menuButton.getAttribute("aria-expanded") === "true";

            menuButton.setAttribute("aria-expanded", String(!open));
            menuButton.setAttribute(
                "aria-label",
                open ? "Open menu" : "Close menu"
            );

            mobileNav.hidden = open;
        });

        mobileNav.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", () => {
                mobileNav.hidden = true;
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open menu");
            });
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !mobileNav.hidden) {
                mobileNav.hidden = true;
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.focus();
            }
        });
    }

    // Scroll reveal animations
    const items = document.querySelectorAll(".reveal");

    if (
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        });

        items.forEach(item => observer.observe(item));
    } else {
        items.forEach(item => item.classList.add("visible"));
    }

    // Automatically select service
    document.querySelectorAll("[data-service]").forEach(link => {
        link.addEventListener("click", () => {
            const select = document.getElementById("service");

            if (select) {
                select.value = link.dataset.service;
            }
        });
    });

    // Formspree contact form integration
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-error");

    if (form && status) {
        form.addEventListener("submit", async event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const submitButton = form.querySelector(
                'button[type="submit"]'
            );

            const originalText = submitButton.textContent;

            status.hidden = true;
            status.textContent = "";

            const formData = new FormData(form);

            // Email subject and reply address
            formData.append("_subject", "New BRANDY Website Enquiry");
            formData.append("_replyto", formData.get("email"));

            submitButton.disabled = true;
            submitButton.textContent = "Sending Enquiry...";

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Accept": "application/json"
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    status.textContent =
                        "Thank you! Your enquiry has been sent successfully. We'll get back to you soon.";

                    status.style.color = "#16803c";
                    status.style.background = "#eaf8ef";
                    status.style.padding = "12px";
                    status.style.borderRadius = "8px";
                    status.hidden = false;

                    form.reset();
                } else {
                    throw new Error(
                        result.errors?.map(e => e.message).join(", ") ||
                        "Unable to send your enquiry. Please try again."
                    );
                }

            } catch (error) {
                status.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                status.style.color = "#c0392b";
                status.style.background = "#fff0eb";
                status.style.padding = "12px";
                status.style.borderRadius = "8px";
                status.hidden = false;

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
});

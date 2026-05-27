/* ============================================================
   FASTER TRANSPORT INC — Site Script
   ============================================================ */

(function () {
    'use strict';

    // ---- Header scroll effect ----
    const header = document.getElementById('header');
    let lastScroll = 0;

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 40);
        lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Mobile nav toggle ----
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open);
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- Scroll-triggered fade-in animations ----
    var fadeTargets = document.querySelectorAll(
        '.trust-item, .service-card, .about-content, .about-image, ' +
        '.gallery-item, .safety-card, .safety-badges, ' +
        '.coverage-content, .coverage-image, .contact-info, .contact-form-wrap'
    );

    fadeTargets.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeTargets.forEach(function (el) {
        observer.observe(el);
    });

    // ---- Stagger animation delays for grid items ----
    function staggerChildren(selector) {
        document.querySelectorAll(selector).forEach(function (parent) {
            var children = parent.children;
            for (var i = 0; i < children.length; i++) {
                children[i].style.transitionDelay = (i * 80) + 'ms';
            }
        });
    }

    staggerChildren('.trust-grid');
    staggerChildren('.services-grid');
    staggerChildren('.safety-grid');
    staggerChildren('.gallery');

    // ---- Safety bar animation ----
    var safetyBars = document.querySelectorAll('.safety-bar-fill');
    var barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    safetyBars.forEach(function (bar) {
        barObserver.observe(bar);
    });

    // ---- Quote form (mailto fallback) ----
    var form = document.getElementById('quoteForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = form.querySelector('#name').value.trim();
            var company = form.querySelector('#company').value.trim();
            var email = form.querySelector('#email').value.trim();
            var phone = form.querySelector('#phone').value.trim();
            var freight = form.querySelector('#freight').value;
            var details = form.querySelector('#details').value.trim();

            var subject = 'Quote Request from ' + name + (company ? ' (' + company + ')' : '');
            var body = [
                'Name: ' + name,
                'Company: ' + company,
                'Email: ' + email,
                'Phone: ' + phone,
                'Freight Type: ' + freight,
                '',
                'Shipment Details:',
                details
            ].join('\n');

            var mailto = 'mailto:dispatch@fastertransport.com'
                + '?subject=' + encodeURIComponent(subject)
                + '&body=' + encodeURIComponent(body);

            window.location.href = mailto;
        });
    }
})();

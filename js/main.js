(function () {
    'use strict';

    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 헤더 스크롤 상태 (플로팅 CTA 노출)
    function onScroll() {
        body.classList.toggle('is-scroll', window.scrollY > 240);
    }
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();

    // 모바일 메뉴
    var gnb = document.getElementById('gnb');
    var btnMenu = document.querySelector('.btn-menu');

    function toggleMenu(open) {
        var willOpen = typeof open === 'boolean' ? open : !gnb.classList.contains('active');
        gnb.classList.toggle('active', willOpen);
        btnMenu.classList.toggle('active', willOpen);
        btnMenu.setAttribute('aria-expanded', String(willOpen));
        btnMenu.setAttribute('aria-label', willOpen ? '메뉴 닫기' : '메뉴 열기');
        body.classList.toggle('is-lock', willOpen);
    }

    btnMenu.addEventListener('click', function () {
        toggleMenu();
    });
    gnb.addEventListener('click', function (e) {
        if (e.target.closest('a')) toggleMenu(false);
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && gnb.classList.contains('active')) toggleMenu(false);
    });

    // 스크롤 등장 효과
    var aosEls = document.querySelectorAll('[data-aos]');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
                setTimeout(function () {
                    el.classList.add('aos-animate');
                }, delay);
                io.unobserve(el);
            });
        }, {rootMargin: '0px 0px -8% 0px'});
        aosEls.forEach(function (el) {
            io.observe(el);
        });
    } else {
        aosEls.forEach(function (el) {
            el.classList.add('aos-animate');
        });
    }

    // 숫자 카운트업
    var counters = document.querySelectorAll('[data-count]');
    function formatNum(n, dec) {
        var s = dec ? n.toFixed(dec) : Math.round(n).toString();
        if (!dec) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return s;
    }
    function runCounter(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
        if (reduceMotion) {
            el.textContent = formatNum(target, dec);
            return;
        }
        var start = null;
        var dur = 1400;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = formatNum(target * eased, dec);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                cio.unobserve(entry.target);
            });
        }, {threshold: 0.4});
        counters.forEach(function (el) {
            cio.observe(el);
        });
    } else {
        counters.forEach(runCounter);
    }

    // 서브 내비 활성화
    var navLinks = document.querySelectorAll('.subnav a[data-nav]');
    var navMap = {};
    navLinks.forEach(function (a) {
        navMap[a.getAttribute('data-nav')] = a;
    });
    var sections = ['top', 'facility', 'pt', 'care', 'info'].map(function (id) {
        return document.getElementById(id);
    }).filter(Boolean);

    function updateNav() {
        var offset = window.innerHeight * 0.35;
        var current = null;
        sections.forEach(function (sec) {
            if (sec.getBoundingClientRect().top <= offset) current = sec.id;
        });
        navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-nav') === current);
        });
        if (current && navMap[current]) {
            var a = navMap[current];
            var box = a.parentNode;
            var left = a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2;
            box.scrollTo({left: left, behavior: 'smooth'});
        }
    }
    window.addEventListener('scroll', updateNav, {passive: true});
    window.addEventListener('resize', updateNav);
    updateNav();

    // 갤러리 드래그 스크롤
    var track = document.querySelector('.gallery-track');
    if (track) {
        var isDown = false, startX = 0, startLeft = 0, moved = false;
        track.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') return;
            isDown = true;
            moved = false;
            startX = e.clientX;
            startLeft = track.scrollLeft;
            track.classList.add('dragging');
            track.setPointerCapture(e.pointerId);
        });
        track.addEventListener('pointermove', function (e) {
            if (!isDown) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 4) moved = true;
            track.scrollLeft = startLeft - dx;
        });
        function endDrag() {
            if (!isDown) return;
            isDown = false;
            track.classList.remove('dragging');
        }
        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);
        track.addEventListener('click', function (e) {
            if (moved) e.preventDefault();
        }, true);
    }

    // FAQ: 하나만 열기
    var faqs = document.querySelectorAll('.faq-list details');
    faqs.forEach(function (d) {
        d.addEventListener('toggle', function () {
            if (!d.open) return;
            faqs.forEach(function (o) {
                if (o !== d) o.open = false;
            });
        });
    });
})();

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light") {
    body.setAttribute("data-theme", "light");
  } else if (storedTheme === "dark") {
    body.removeAttribute("data-theme");
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    body.setAttribute("data-theme", "light");
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (current === "dark") {
        body.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
      } else {
        body.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
      refreshWaveColors();
    });
  }

  const yearTarget = document.getElementById("year");
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const heroAudio = document.getElementById("hero-audio");
  const heroSoundButton = document.getElementById("hero-sound");
  if (heroAudio && heroSoundButton) {
    heroSoundButton.addEventListener("click", async () => {
      if (heroAudio.paused) {
        await heroAudio.play();
        heroSoundButton.textContent = "Pause Loop";
      } else {
        heroAudio.pause();
        heroSoundButton.textContent = "Signature Loop";
      }
    });
    heroAudio.addEventListener("ended", () => {
      heroSoundButton.textContent = "Signature Loop";
    });
  }

  const tagAudio = document.getElementById("tag-audio");
  const tagTrigger = document.getElementById("tag-trigger");
  if (tagAudio && tagTrigger) {
    tagTrigger.addEventListener("click", async () => {
      tagAudio.currentTime = 0;
      await tagAudio.play();
    });
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.hasAttribute("data-counter")) {
            animateCounter(entry.target);
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));
  document.querySelectorAll(".stat-value").forEach(el => observer.observe(el));

  function animateCounter(element) {
    if (element.dataset.counted) return;
    element.dataset.counted = "true";
    const target = parseInt(element.dataset.counter, 10);
    const start = 0;
    const duration = 1800;
    const startTime = performance.now();
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (target - start) + start);
      element.textContent = value.toString();
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
    );
    gsap.utils.toArray("section").forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%"
        }
      });
    });
  }

  const filters = document.querySelectorAll(".filter-btn");
  const beatCards = document.querySelectorAll(".beat-card");
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      beatCards.forEach(card => {
        card.style.display = filter === "all" || card.dataset.category === filter ? "grid" : "none";
      });
    });
  });

  const modal = document.getElementById("licensing-modal");
  const modalBeat = document.getElementById("modal-beat");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalClose = document.getElementById("modal-close");
  document.querySelectorAll(".license-btn").forEach(button => {
    button.addEventListener("click", () => {
      const beat = button.dataset.beat || "";
      if (modalBeat) {
        modalBeat.textContent = `Select a licensing tier for ${beat}.`;
      }
      if (modal) {
        modal.setAttribute("aria-hidden", "false");
      }
      if (modal) {
        modal.setAttribute("aria-modal", "true");
      }
    });
  });
  [modalBackdrop, modalClose].forEach(el => {
    if (!el) return;
    el.addEventListener("click", closeModal);
  });
  function closeModal() {
    if (modal) {
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("aria-modal", "false");
    }
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
      if (sampler && sampler.classList.contains("active")) {
        sampler.classList.remove("active");
        sampler.setAttribute("aria-hidden", "true");
      }
    }
  });

  const sampler = document.getElementById("sampler");
  const brand = document.getElementById("brand");
  const samplerOverlay = document.getElementById("sampler-overlay");
  const samplerClose = document.getElementById("sampler-close");
  if (brand && sampler) {
    brand.addEventListener("click", () => {
      sampler.classList.add("active");
      sampler.setAttribute("aria-hidden", "false");
    });
  }
  [samplerOverlay, samplerClose].forEach(el => {
    if (!el) return;
    el.addEventListener("click", () => {
      sampler.classList.remove("active");
      sampler.setAttribute("aria-hidden", "true");
    });
  });

  const playingSamples = new Map();
  document.querySelectorAll(".sampler-pad").forEach(pad => {
    pad.addEventListener("click", () => {
      const src = pad.dataset.sample;
      if (!src) return;
      const audio = new Audio(src);
      playingSamples.set(pad, audio);
      pad.classList.add("playing");
      audio.play();
      audio.addEventListener("ended", () => {
        pad.classList.remove("playing");
        playingSamples.delete(pad);
      });
    });
  });

  let wavesurferInstances = [];
  if (window.WaveSurfer) {
    wavesurferInstances = Array.from(document.querySelectorAll(".waveform")).map(container => {
      const instance = WaveSurfer.create({
        container,
        waveColor: getComputedStyle(document.body).getPropertyValue("--text-muted"),
        progressColor: getComputedStyle(document.body).getPropertyValue("--accent"),
        cursorColor: "transparent",
        barWidth: 2,
        barGap: 2,
        height: 80,
        responsive: true,
        url: container.dataset.audio
      });
      return { container, instance };
    });
    refreshWaveColors();
  } else {
    document.querySelectorAll(".waveform").forEach(container => {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = container.dataset.audio;
      container.appendChild(audio);
    });
  }

  function refreshWaveColors() {
    if (!window.WaveSurfer) return;
    const waveColor = getComputedStyle(document.body).getPropertyValue("--text-muted");
    const progressColor = getComputedStyle(document.body).getPropertyValue("--accent");
    wavesurferInstances.forEach(item => {
      if (item.instance && item.instance.setOptions) {
        item.instance.setOptions({ waveColor, progressColor });
        item.instance.drawBuffer();
      }
    });
  }

  const beatState = new Map();
  document.querySelectorAll(".beat-card").forEach(card => {
    const playButton = card.querySelector(".play-btn");
    const waveform = card.querySelector(".waveform");
    if (!playButton || !waveform) return;
    playButton.addEventListener("click", () => {
      if (window.WaveSurfer) {
        const pair = wavesurferInstances.find(item => item.container === waveform);
        if (!pair) return;
        wavesurferInstances.forEach(item => {
          if (item !== pair) {
            item.instance.pause();
            const parentCard = item.container.closest(".beat-card");
            if (parentCard) {
              const btn = parentCard.querySelector(".play-btn");
              if (btn) btn.textContent = "Play";
            }
          }
        });
        if (pair.instance.isPlaying()) {
          pair.instance.pause();
          playButton.textContent = "Play";
        } else {
          pair.instance.play();
          playButton.textContent = "Pause";
        }
        pair.instance.on("finish", () => {
          playButton.textContent = "Play";
        });
      } else {
        let audio = beatState.get(card);
        if (!audio) {
          audio = new Audio(waveform.dataset.audio);
          beatState.set(card, audio);
        }
        beatState.forEach((a, c) => {
          if (c !== card) {
            a.pause();
            a.currentTime = 0;
            const btn = c.querySelector(".play-btn");
            if (btn) btn.textContent = "Play";
          }
        });
        if (audio.paused) {
          audio.play();
          playButton.textContent = "Pause";
        } else {
          audio.pause();
          playButton.textContent = "Play";
        }
        audio.addEventListener("ended", () => {
          playButton.textContent = "Play";
        });
      }
    });
  });

  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", event => {
      event.preventDefault();
      const button = newsletterForm.querySelector("button");
      if (button) {
        const original = button.textContent;
        button.textContent = "Joined";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
          newsletterForm.reset();
        }, 2400);
      }
    });
  }

  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("pointermove", event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--parallax-x", x);
      hero.style.setProperty("--parallax-y", y);
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--parallax-x", 0);
      hero.style.setProperty("--parallax-y", 0);
    });
  }
});

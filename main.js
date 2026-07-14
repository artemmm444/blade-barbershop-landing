import { CONFIG } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.style.setProperty("--accent", CONFIG.accent);

$$("[data-brand]").forEach((el) => (el.textContent = CONFIG.brand));
$("[data-tagline]").textContent = CONFIG.tagline;
$("[data-hero-title]").innerHTML = CONFIG.hero.title
  .split("\n")
  .map(
    (line, li) =>
      `<span class="tline">${line
        .split(" ")
        .map((w, wi) => `<span class="tw" style="--d:${(li * 3 + wi) * 90}ms"><span>${esc(w)}</span></span>`)
        .join(" ")}</span>`
  )
  .join(" ");
$("[data-hero-sub]").textContent = CONFIG.hero.subtitle;
$("[data-hero-cta]").textContent = CONFIG.hero.cta;
document.title = `${CONFIG.brand} — ${CONFIG.tagline}`;

const marqueeItems = [...CONFIG.marquee, ...CONFIG.marquee]
  .map((w) => `<span>${esc(w)}</span><span class="dot">✦</span>`)
  .join("");
$("[data-marquee]").innerHTML = marqueeItems;

const rating = CONFIG.stats.find((s) => s.label.includes("рейтинг"));
const clients = CONFIG.stats.find((s) => s.label.includes("клиент"));
$("[data-stamp]").innerHTML =
  `<span>Москва</span><span>·</span><span>${esc(rating?.n ?? "")}★ · ${esc(clients?.n ?? "")} клиентов</span>`;

$("[data-stats]").innerHTML = CONFIG.stats
  .map(
    (s) => `
    <div data-reveal>
      <div class="stat__n" data-count="${esc(s.n)}">${esc(s.n)}</div>
      <div class="stat__label">${esc(s.label)}</div>
    </div>`
  )
  .join("");

/* цифры статистики считают вверх при появлении */
if (!reduceMotion) {
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      statIO.unobserve(en.target);
      const raw = en.target.dataset.count;
      const m = raw.match(/^([\d.,]+)(.*)$/);
      if (!m) return;
      const target = parseFloat(m[1].replace(",", "."));
      const suffix = m[2];
      const decimals = m[1].includes(".") || m[1].includes(",") ? 1 : 0;
      const start = performance.now();
      const step = (now) => {
        const k = Math.min((now - start) / 1300, 1);
        const val = (target * (1 - Math.pow(1 - k, 3))).toFixed(decimals);
        en.target.textContent = `${val}${suffix}`;
        if (k < 1) requestAnimationFrame(step);
        else en.target.textContent = raw;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$(".stat__n").forEach((el) => statIO.observe(el));
}

$("[data-services]").innerHTML = CONFIG.services
  .map(
    (s, i) => `
    <article class="ledger__row" data-reveal>
      <span class="ledger__idx">${String(i + 1).padStart(2, "0")}</span>
      <div>
        <h3 class="ledger__name">${esc(s.name)}</h3>
        <p class="ledger__desc">${esc(s.desc)}</p>
      </div>
      <span class="ledger__time">${esc(s.time)}</span>
      <span class="ledger__price">${esc(s.price)}</span>
    </article>`
  )
  .join("");

/* сборка визита: клик по строке прайса */
const picked = new Set();
const pickerEl = $("[data-picker]");
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

function renderPicker() {
  const items = [...picked].map((i) => CONFIG.services[i]);
  pickerEl.hidden = items.length === 0;
  if (!items.length) return;
  const sum = items.reduce((s, x) => s + parseInt(x.price, 10), 0);
  const time = items.reduce((s, x) => s + parseInt(x.time, 10), 0);
  $("[data-picker-count]").textContent =
    `${items.length} ${plural(items.length, "услуга", "услуги", "услуг")}`;
  $("[data-picker-meta]").textContent =
    `${sum.toLocaleString("ru-RU")} ₽ · ~${time} мин`;
}

$$(".ledger__row").forEach((row, i) => {
  row.classList.add("is-pickable");
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  const toggle = () => {
    picked.has(i) ? picked.delete(i) : picked.add(i);
    row.classList.toggle("is-picked", picked.has(i));
    renderPicker();
  };
  row.addEventListener("click", toggle);
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
});

$("[data-picker-go]").addEventListener("click", () => {
  const names = [...picked].map((i) => CONFIG.services[i].name);
  const msgField = $("[data-form]").message;
  if (names.length) msgField.value = `Хочу: ${names.join(", ").toLowerCase()}`;
});

$("[data-picker-clear]").addEventListener("click", () => {
  picked.clear();
  $$(".ledger__row").forEach((r) => r.classList.remove("is-picked"));
  renderPicker();
});

$("[data-steps]").innerHTML = CONFIG.steps
  .map(
    (s) => `
    <div class="step" data-reveal>
      <div class="step__n">${esc(s.n)}</div>
      <h3 class="step__title">${esc(s.title)}</h3>
      <p class="step__text">${esc(s.text)}</p>
    </div>`
  )
  .join("");

const reviewCard = (r) => `
    <article class="review-card">
      <div class="review__stars">${"★".repeat(r.stars)}</div>
      <p class="review__text">«${esc(r.text)}»</p>
      <p class="review__name">${esc(r.name)}</p>
    </article>`;
$("[data-reviews]").innerHTML = [...CONFIG.reviews, ...CONFIG.reviews].map(reviewCard).join("");

const c = CONFIG.contacts;
const tgLink = c.telegram.replace(/^@/, "");
const mapLink = `https://maps.google.com/?q=${encodeURIComponent(c.mapQuery)}`;
$("[data-contacts]").innerHTML = `
  <li>📞 <a href="tel:${c.phone.replace(/\s/g, "")}"><strong>${esc(c.phone)}</strong></a></li>
  <li>✈️ <a href="https://t.me/${esc(tgLink)}" target="_blank" rel="noopener"><strong>${esc(c.telegram)}</strong></a></li>
  <li>📍 <a href="${mapLink}" target="_blank" rel="noopener">${esc(c.address)}</a></li>
  <li>🕒 ${esc(c.hours)}</li>`;

const form = $("[data-form]");
const statusEl = $("[data-status]");
const submitBtn = $(".form__submit", form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");

  const data = {
    name: form.name.value.trim(),
    contact: form.contact.value.trim(),
    message: form.message.value.trim(),
  };

  if (!data.name || !data.contact) {
    setStatus("Укажите имя и контакт.", "is-err");
    return;
  }

  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  submitBtn.textContent = "Отправляем…";

  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      form.reset();
      setStatus("✅ Заявка отправлена! Скоро свяжемся.", "is-ok");
    } else {
      setStatus(json.error || "Не удалось отправить. Попробуйте ещё раз.", "is-err");
    }
  } catch {
    setStatus("Сеть недоступна. Проверьте соединение.", "is-err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
});

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = `form__status ${cls}`;
}

function esc(str = "") {
  return String(str).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
}

if (!reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));
} else {
  $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
}

const cursor = $("[data-cursor]");
if (cursor && !reduceMotion && matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    cursor.classList.add("is-live");
  });
  $$("a, button, .ledger__row, .review-card, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

const heroBg = $("[data-parallax]");
if (heroBg && !reduceMotion) {
  window.addEventListener(
    "scroll",
    () => {
      const y = Math.min(window.scrollY, 800) * 0.15;
      heroBg.style.transform = `translateY(${y}px)`;
    },
    { passive: true }
  );
}

"use strict";

// Ядро программы: список разделов, хранилище, меню и переключение разделов.
window.Studio = {
  // Список разделов. Порядок и названия как в твоём скриншоте.
  sections: [
    { id: "home", title: "Главная", icon: "🏠", group: "", description: "" },
    { id: "niches", title: "Поиск ниш", icon: "🎯", group: "СТУДИЯ", description: "Поиск и оценка ниш для канала по данным YouTube. Будет готов на Этапе 2." },
    { id: "ai", title: "AI Студия", icon: "✨", group: "СТУДИЯ", description: "Цепочка: тема, сценарий, озвучка, картинки, монтаж. Будет готова на Этапе 7." },
    { id: "montage", title: "Монтаж", icon: "✂️", group: "СТУДИЯ", description: "Сборка ролика из клипов, озвучки и субтитров. Будет готов на Этапе 6." },
    { id: "plan", title: "Контент-план", icon: "🗓️", group: "СТУДИЯ", description: "Календарь публикаций и идеи для роликов. Будет готов на Этапе 4." },
    { id: "analytics", title: "Аналитика", icon: "📊", group: "СТУДИЯ", description: "Статистика твоих каналов и лучшие видео. Будет готова на Этапе 3." },
    { id: "money", title: "Монетизация", icon: "💰", group: "СТУДИЯ", description: "Трекер условий заработка и учёт доходов. Будет готова на Этапе 8." },
    { id: "styles", title: "Motion-стили", icon: "🎨", group: "РЕСУРСЫ", description: "Готовые стили анимации текста и переходов. Будут готовы на Этапе 6." },
    { id: "voices", title: "Голоса", icon: "🎙️", group: "РЕСУРСЫ", description: "Бесплатная озвучка текста и выбор голоса. Будет готова на Этапе 5." },
    { id: "channels", title: "Мои каналы", icon: "📡", group: "РЕСУРСЫ", description: "Подключение твоих каналов YouTube. Будет готово на Этапе 3." },
    { id: "settings", title: "Настройки", icon: "⚙️", group: "РЕСУРСЫ", description: "Ключи доступа к сервисам." }
  ],

  // Сюда разделы регистрируют свои функции отрисовки: Studio.renderers.settings = function...
  renderers: {},

  // Создаёт HTML-элемент. Текст вставляется безопасно, как обычный текст.
  el: function (tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  },

  // Хранилище данных в браузере (на этом устройстве).
  storage: {
    get: function (key, fallback) {
      try {
        const value = localStorage.getItem("studio_" + key);
        return value === null ? (fallback === undefined ? "" : fallback) : value;
      } catch (e) {
        return fallback === undefined ? "" : fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem("studio_" + key, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem("studio_" + key);
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  // Показывает сообщение в блоке. type: "ok", "err" или пусто.
  showMessage: function (node, text, type) {
    node.className = "msg" + (type ? " " + type : "");
    node.textContent = text;
  },

  // Какой раздел открыт сейчас (берётся из адреса после знака #).
  getCurrentId: function () {
    const id = window.location.hash.replace("#", "");
    return Studio.sections.some(function (s) { return s.id === id; }) ? id : "home";
  },

  // Строит боковое меню.
  buildMenu: function () {
    const nav = document.getElementById("sidebar");
    nav.replaceChildren();
    nav.appendChild(Studio.el("div", "brand", "Моя студия"));
    let lastGroup = null;
    Studio.sections.forEach(function (s) {
      if (s.group && s.group !== lastGroup) {
        nav.appendChild(Studio.el("div", "menu-group", s.group));
        lastGroup = s.group;
      }
      const link = document.createElement("a");
      link.className = "menu-link";
      link.href = "#" + s.id;
      link.dataset.id = s.id;
      link.appendChild(Studio.el("span", "menu-icon", s.icon));
      link.appendChild(Studio.el("span", "", s.title));
      nav.appendChild(link);
    });
  },

  openMenu: function () {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("overlay").classList.add("open");
  },

  closeMenu: function () {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
  },

  // Заглушка для разделов, которые ещё не сделаны.
  renderPlaceholder: function (container, section) {
    const card = Studio.el("div", "card");
    card.appendChild(Studio.el("div", "badge", "В разработке"));
    card.appendChild(Studio.el("h2", "", section.icon + " " + section.title));
    card.appendChild(Studio.el("p", "muted", section.description));
    container.appendChild(card);
  },

  // Показывает нужный раздел.
  render: function () {
    const id = Studio.getCurrentId();
    const section = Studio.sections.find(function (s) { return s.id === id; });
    document.getElementById("pageTitle").textContent = section.title;

    const container = document.getElementById("content");
    container.replaceChildren();

    const renderer = Studio.renderers[id];
    try {
      if (renderer) {
        renderer(container, section);
      } else {
        Studio.renderPlaceholder(container, section);
      }
    } catch (e) {
      container.replaceChildren();
      const card = Studio.el("div", "card");
      card.appendChild(Studio.el("h2", "", "Ошибка в разделе «" + section.title + "»"));
      card.appendChild(Studio.el("p", "msg err", e.message));
      container.appendChild(card);
    }

    document.querySelectorAll(".menu-link").forEach(function (link) {
      link.classList.toggle("active", link.dataset.id === id);
    });
    Studio.closeMenu();
    window.scrollTo(0, 0);
  },

  // Запуск программы.
  start: function () {
    Studio.buildMenu();

    document.getElementById("menuBtn").addEventListener("click", function () {
      const isOpen = document.getElementById("sidebar").classList.contains("open");
      if (isOpen) { Studio.closeMenu(); } else { Studio.openMenu(); }
    });
    document.getElementById("overlay").addEventListener("click", Studio.closeMenu);
    document.getElementById("sidebar").addEventListener("click", function (event) {
      if (event.target.closest(".menu-link")) Studio.closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") Studio.closeMenu();
    });
    window.addEventListener("hashchange", Studio.render);

    Studio.render();
  }
};

// Главная страница: плитки разделов и статус ключей.
Studio.renderers.home = function (container) {
  const intro = Studio.el("div", "card");
  intro.appendChild(Studio.el("h2", "", "Добро пожаловать"));
  intro.appendChild(Studio.el("p", "muted", "Открой меню слева вверху и выбери раздел. Разделы с отметкой «в разработке» мы будем делать по этапам."));
  container.appendChild(intro);

  const keys = Studio.el("div", "card");
  keys.appendChild(Studio.el("h2", "", "Ключи доступа"));
  const ytSaved = Studio.storage.get("youtube_key") !== "";
  const gmSaved = Studio.storage.get("gemini_key") !== "";
  keys.appendChild(Studio.el("p", "", "YouTube: " + (ytSaved ? "добавлен" : "не добавлен")));
  keys.appendChild(Studio.el("p", "", "Gemini: " + (gmSaved ? "добавлен" : "не добавлен")));
  const settingsLink = Studio.el("a", "", "Открыть настройки");
  settingsLink.href = "#settings";
  settingsLink.style.color = "var(--accent)";
  keys.appendChild(settingsLink);
  container.appendChild(keys);

  const grid = Studio.el("div", "grid");
  Studio.sections.forEach(function (s) {
    if (s.id === "home") return;
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = "#" + s.id;
    tile.appendChild(Studio.el("div", "tile-icon", s.icon));
    tile.appendChild(Studio.el("div", "tile-title", s.title));
    const ready = Boolean(Studio.renderers[s.id]);
    tile.appendChild(Studio.el("span", ready ? "badge ready" : "badge", ready ? "готов" : "в разработке"));
    grid.appendChild(tile);
  });
  container.appendChild(grid);
};

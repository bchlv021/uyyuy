"use strict";

// Раздел «Настройки»: хранение и проверка ключей.
(function () {
  const YOUTUBE_KEY = "youtube_key";
  const GEMINI_KEY = "gemini_key";

  // Показывает ключ в скрытом виде: первые и последние 4 символа.
  function maskKey(key) {
    if (!key) return "не добавлен";
    if (key.length <= 8) return "сохранён";
    return "сохранён: " + key.slice(0, 4) + "…" + key.slice(-4);
  }

  // Проверка ключа YouTube: запрашиваем одно тестовое видео (стоит 1 единицу квоты).
  async function checkYouTubeKey(key) {
    try {
      const url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=" + encodeURIComponent(key);
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        const text = data.error && data.error.message ? data.error.message : "код " + response.status;
        return { ok: false, message: "Ошибка: " + text };
      }
      if (data.items && data.items.length > 0) {
        return { ok: true, message: "Ключ работает. Тестовое видео: " + data.items[0].snippet.title };
      }
      return { ok: false, message: "Ключ принят, но тестовое видео не найдено." };
    } catch (e) {
      return { ok: false, message: "Не удалось выполнить запрос: " + e.message };
    }
  }
  Studio.checkYouTubeKey = checkYouTubeKey;

  // Строит карточку для одного ключа.
  function buildKeyCard(options) {
    const card = Studio.el("div", "card");
    card.appendChild(Studio.el("h2", "", options.title));
    card.appendChild(Studio.el("p", "muted", options.help));

    const status = Studio.el("div", "badge", "");
    card.appendChild(status);

    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = options.placeholder;
    input.autocomplete = "off";
    card.appendChild(input);

    const row = Studio.el("div", "btn-row");
    const saveBtn = Studio.el("button", "btn", "Сохранить");
    const deleteBtn = Studio.el("button", "btn danger", "Удалить");
    row.appendChild(saveBtn);
    let checkBtn = null;
    if (options.onCheck) {
      checkBtn = Studio.el("button", "btn secondary", "Проверить");
      row.appendChild(checkBtn);
    }
    row.appendChild(deleteBtn);
    card.appendChild(row);

    const message = Studio.el("div", "msg", "");
    card.appendChild(message);

    function updateStatus() {
      status.textContent = "Ключ: " + maskKey(Studio.storage.get(options.storageKey));
    }
    updateStatus();

    saveBtn.addEventListener("click", function () {
      const value = input.value.trim();
      if (!value) {
        Studio.showMessage(message, "Сначала вставь ключ в поле.", "err");
        return;
      }
      if (!Studio.storage.set(options.storageKey, value)) {
        Studio.showMessage(message, "Не удалось сохранить: браузер блокирует хранение данных.", "err");
        return;
      }
      input.value = "";
      updateStatus();
      Studio.showMessage(message, "Ключ сохранён на этом устройстве.", "ok");
    });

    deleteBtn.addEventListener("click", function () {
      Studio.storage.remove(options.storageKey);
      input.value = "";
      updateStatus();
      Studio.showMessage(message, "Ключ удалён.", "");
    });

    if (checkBtn) {
      checkBtn.addEventListener("click", async function () {
        const key = input.value.trim() || Studio.storage.get(options.storageKey);
        if (!key) {
          Studio.showMessage(message, "Сначала вставь или сохрани ключ.", "err");
          return;
        }
        checkBtn.disabled = true;
        Studio.showMessage(message, "Проверяю...", "");
        const result = await options.onCheck(key);
        Studio.showMessage(message, result.message, result.ok ? "ok" : "err");
        checkBtn.disabled = false;
      });
    }

    return card;
  }

  Studio.renderers.settings = function (container) {
    container.appendChild(Studio.el("p", "muted", "Ключи хранятся только в этом браузере на этом устройстве. Не вводи их на чужом телефоне или компьютере."));

    container.appendChild(buildKeyCard({
      title: "YouTube Data API",
      help: "Нужен для поиска ниш и аналитики. Бесплатный лимит: 10 000 единиц в день.",
      placeholder: "Ключ YouTube API",
      storageKey: YOUTUBE_KEY,
      onCheck: checkYouTubeKey
    }));

    container.appendChild(buildKeyCard({
      title: "Gemini API",
      help: "Нужен для идей и сценариев с Этапа 4. Получить можно на aistudio.google.com, добавить можно позже.",
      placeholder: "Ключ Gemini API",
      storageKey: GEMINI_KEY,
      onCheck: null
    }));
  };
})();

const words = [
  {
    word: "serendipity",
    translation: "счастливая случайность",
    transcription: "/ˌser.ənˈdɪp.ɪ.ti/",
    context:
      "Their meeting was pure serendipity — they both missed the same train and stayed for coffee.",
    level: "C1 • Впечатлять",
    tags: ["чувства", "удача", "существительное"],
  },
  {
    word: "meticulous",
    translation: "тщательный, дотошный",
    transcription: "/məˈtɪk.jə.ləs/",
    context: "She kept meticulous notes of every detail during the expedition.",
    level: "C1 • Точность",
    tags: ["характер", "прилагательное"],
  },
  {
    word: "to embrace",
    translation: "принять, охватить",
    transcription: "/ɪmˈbreɪs/",
    context:
      "Modern leaders have to embrace uncertainty and make decisions without complete information.",
    level: "B2 • Навыки",
    tags: ["глагол", "карьера"],
  },
  {
    word: "insightful",
    translation: "проницательный, глубокий",
    transcription: "/ɪnˈsaɪt.fəl/",
    context: "The documentary offered an insightful look at life in remote communities.",
    level: "C1 • Мыслить",
    tags: ["интеллект", "прилагательное"],
  },
  {
    word: "to nurture",
    translation: "взращивать, поддерживать",
    transcription: "/ˈnɜː.tʃər/",
    context: "Parents try to nurture their children’s curiosity about the world.",
    level: "B2 • Забота",
    tags: ["семья", "глагол"],
  },
  {
    word: "captivating",
    translation: "захватывающий, чарующий",
    transcription: "/ˈkæp.tɪ.veɪ.tɪŋ/",
    context: "Her captivating storytelling held everyone in the room spellbound.",
    level: "C1 • Вдохновлять",
    tags: ["прилагательное", "эмоции"],
  },
  {
    word: "versatile",
    translation: "универсальный, разносторонний",
    transcription: "/ˈvɜː.sə.taɪl/",
    context: "This jacket is versatile enough to wear in the city or on the mountain trail.",
    level: "B2 • Гибкость",
    tags: ["прилагательное", "жизнь"],
  },
  {
    word: "resilience",
    translation: "устойчивость, стойкость",
    transcription: "/rɪˈzɪl.jəns/",
    context:
      "Communities showed remarkable resilience while rebuilding after the hurricane.",
    level: "C1 • Характер",
    tags: ["существительное", "мотивация"],
  },
  {
    word: "deliberately",
    translation: "преднамеренно, осознанно",
    transcription: "/dɪˈlɪb.ər.ət.li/",
    context: "He spoke deliberately, ensuring everyone understood the instructions.",
    level: "C1 • Контроль",
    tags: ["наречие", "общение"],
  },
  {
    word: "to flourish",
    translation: "процветать, расцветать",
    transcription: "/ˈflʌr.ɪʃ/",
    context: "The artist began to flourish once she found her unique style.",
    level: "C1 • Рост",
    tags: ["глагол", "саморазвитие"],
  },
  {
    word: "compelling",
    translation: "убедительный, захватывающий",
    transcription: "/kəmˈpel.ɪŋ/",
    context: "The lawyer presented a compelling argument that swayed the jury.",
    level: "C1 • Аргументы",
    tags: ["прилагательное", "общение"],
  },
  {
    word: "mindful",
    translation: "осознанный, внимательный",
    transcription: "/ˈmaɪnd.fəl/",
    context: "Be mindful of how you spend your time online; balance is key.",
    level: "B2 • Баланс",
    tags: ["прилагательное", "осознанность"],
  },
];

const state = {
  queue: shuffle(Array.from({ length: words.length }, (_, index) => index)),
  learned: new Set(),
  revealed: false,
  active: null,
};

const card = document.getElementById("card");
const wordEl = document.getElementById("word");
const transcriptionEl = document.getElementById("transcription");
const translationEl = document.getElementById("translation");
const contextEl = document.getElementById("context");
const tagsEl = document.getElementById("tags");
const levelEl = document.getElementById("word-level");
const revealBtn = document.getElementById("reveal");
const repeatBtn = document.getElementById("repeat");
const knowBtn = document.getElementById("know");
const progressValueEl = document.getElementById("progress-value");
const progressFillEl = document.getElementById("progress-fill");
const tagTemplate = document.getElementById("tag-template");

revealBtn.addEventListener("click", () => {
  setRevealed(!state.revealed);
});

repeatBtn.addEventListener("click", () => {
  if (state.active === null) return;
  state.queue.push(state.active);
  nextCard();
});

knowBtn.addEventListener("click", () => {
  if (state.active === null) return;
  state.learned.add(state.active);
  updateProgress();
  nextCard();
});

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function setRevealed(value) {
  state.revealed = value;
  card.classList.toggle("card--concealed", !value);
  revealBtn.textContent = value ? "Скрыть перевод" : "Показать перевод";
}

function renderCard(index) {
  const item = words[index];
  wordEl.textContent = capitalize(item.word);
  transcriptionEl.textContent = item.transcription;
  translationEl.textContent = capitalize(item.translation);
  contextEl.textContent = item.context;
  levelEl.textContent = item.level;

  tagsEl.replaceChildren();
  item.tags.forEach((tag) => {
    const element = tagTemplate.content.firstElementChild.cloneNode(true);
    element.textContent = tag;
    tagsEl.appendChild(element);
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function updateProgress() {
  const learnedCount = state.learned.size;
  const total = words.length;
  const percent = Math.round((learnedCount / total) * 100);
  progressValueEl.textContent = `${learnedCount} / ${total}`;
  progressFillEl.style.width = `${percent}%`;
}

function nextCard() {
  if (state.queue.length === 0) {
    return showCompletion();
  }

  state.active = state.queue.shift();
  setRevealed(false);
  renderCard(state.active);
}

function showCompletion() {
  card.classList.remove("card--concealed");
  card.innerHTML = `
    <div class="card__pill">Вы великолепны!</div>
    <h2 class="card__word">Все слова повторены</h2>
    <p class="card__context">
      Продолжайте тренироваться: добавьте новые слова или ещё раз пройдитесь по карточкам.
    </p>
  `;
  revealBtn.disabled = true;
  repeatBtn.disabled = true;
  knowBtn.disabled = true;
}

updateProgress();
setRevealed(false);
nextCard();

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const loading = document.getElementById("loading");

function getOptimizedImage(url) {
  if (!url) return "";
  return url.replace("/media/games/", "/media/crop/600/400/games/");
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// Reset active styles on category buttons
function clearActiveButtons() {
  document.querySelectorAll("[data-challenge]").forEach((btn) => {
    btn.classList.remove("active");
  });
}

async function fetchGames(params = {}) {
  loading.classList.add("active");
  results.innerHTML = "";

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", RAWG_API_KEY);
  url.searchParams.set("page_size", "12");

  // Only append valid keys provided in params
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load titles.");
    const data = await res.json();
    displayResults(data.results);
  } catch (err) {
    results.innerHTML = `<div class="error-message">⚠️ ${escapeHTML(err.message)}</div>`;
  } finally {
    loading.classList.remove("active");
  }
}

function displayResults(games) {
  if (!games || games.length === 0) {
    results.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #9ca3af;">No titles found.</p>`;
    return;
  }

  games.forEach((game) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const imgUrl = game.background_image ? getOptimizedImage(game.background_image) : "";
    const imgHtml = imgUrl
      ? `<img src="${imgUrl}" alt="${escapeHTML(game.name)}" class="game-image" loading="lazy" />`
      : `<div class="image-placeholder">🎮</div>`;

    const rating = game.rating ? `⭐ ${game.rating}` : "N/A";

    card.innerHTML = `
      <div class="image-container">
        <span class="card-badge">${rating}</span>
        ${imgHtml}
      </div>
      <div class="game-info">
        <h2>${escapeHTML(game.name)}</h2>
        <p><strong>Released:</strong> ${escapeHTML(game.released) || "TBA"}</p>
        <a href="https://rawg.io/games/${game.slug}" target="_blank" rel="noopener">Explore Title ↗</a>
      </div>
    `;

    results.appendChild(card);
  });
}

// Search form handler
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();
  if (term) {
    clearActiveButtons(); // Clear active category highlight on text search
    fetchGames({ search: term });
  }
});

// Category button handler
document.querySelectorAll("[data-challenge]").forEach((btn) => {
  btn.addEventListener("click", () => {
    // 1. Clear text input completely
    searchInput.value = "";
    
    // 2. Manage active button states
    clearActiveButtons();
    btn.classList.add("active");

    // 3. Fetch strictly by genre
    fetchGames({ genres: btn.dataset.challenge });
  });
});

// Initial load (default to Action genre)
const initialBtn = document.querySelector('[data-challenge="action"]');
if (initialBtn) initialBtn.classList.add("active");
fetchGames({ genres: "action" });
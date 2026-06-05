function normalize(text) {
  return text.toLowerCase().trim().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function scoreMatch(input, item) {
  const normalized = normalize(input);
  if (!normalized) return 0;

  let best = 0;

  for (const keyword of item.keywords) {
    const kw = normalize(keyword);

    if (normalized === kw) return 100;

    if (normalized.includes(kw) || kw.includes(normalized)) {
      best = Math.max(best, 80);
      continue;
    }

    const inputWords = normalized.split(" ");
    const kwWords = kw.split(" ");
    const overlap = inputWords.filter((w) => kwWords.some((k) => k.includes(w) || w.includes(k))).length;
    const score = (overlap / Math.max(inputWords.length, kwWords.length)) * 70;
    best = Math.max(best, score);
  }

  if (normalize(item.name).includes(normalized) || normalized.includes(normalize(item.name))) {
    best = Math.max(best, 75);
  }

  return best;
}

function looksLikeSnackQuery(query) {
  const n = normalize(query);
  return SNACK_HEURISTICS.snackWords.some((w) => n.includes(w)) ||
    SNACK_ITEMS.some((item) => scoreMatch(n, item) >= 25);
}

function inferSnackPlastic(query) {
  const n = normalize(query);
  const hasHigh = SNACK_HEURISTICS.highRiskWords.some((w) => n.includes(w));
  const hasLow = SNACK_HEURISTICS.lowRiskWords.some((w) => n.includes(w));

  if (hasLow && !hasHigh) return { containsPlastic: "Unlikely", reason: "Input suggests fresh, loose, or unpackaged food." };
  if (hasHigh && !hasLow) return { containsPlastic: "Likely", reason: "Input suggests packaged, wrapped, or processed snack." };
  if (hasHigh && hasLow) return { containsPlastic: "Possible", reason: "Mixed signals—may be packaged despite fresh keywords." };
  return { containsPlastic: "Possible", reason: "Packaged snacks often contact plastic; fresh whole foods generally do not." };
}

function findInDatabase(query, database) {
  const normalized = normalize(query);
  if (!normalized) return { item: null, score: 0 };

  let bestItem = null;
  let bestScore = 0;

  for (const item of database) {
    const score = scoreMatch(normalized, item);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return { item: bestScore >= 25 ? bestItem : null, score: bestScore };
}

function findItem(query) {
  const snackResult = findInDatabase(query, SNACK_ITEMS);
  const itemResult = findInDatabase(query, PLASTIC_ITEMS);

  if (snackResult.score >= itemResult.score) {
    return { item: snackResult.item, score: snackResult.score, type: "snack" };
  }
  return { item: itemResult.item, score: itemResult.score, type: "item" };
}

function getFilenameQuery(file) {
  if (!file) return "";
  const name = file.name.replace(/\.[^.]+$/, "");
  return normalize(name);
}

function analyzeItem(textQuery, imageFile) {
  const queries = [];

  if (textQuery && normalize(textQuery)) {
    queries.push(normalize(textQuery));
  }

  if (imageFile) {
    const filenameQuery = getFilenameQuery(imageFile);
    if (filenameQuery) queries.push(filenameQuery);
  }

  if (queries.length === 0) return { item: null, matchedQuery: "", confidence: "none" };

  let bestItem = null;
  let bestScore = 0;
  let bestType = "item";
  let matchedQuery = queries[0];

  for (const query of queries) {
    const found = findItem(query);
    if (found.item && found.score > bestScore) {
      bestScore = found.score;
      bestItem = found.item;
      bestType = found.type;
      matchedQuery = query;
    }
  }

  const isSnackQuery = queries.some(looksLikeSnackQuery);

  if (!bestItem && isSnackQuery) {
    const inferred = inferSnackPlastic(matchedQuery);
    return {
      item: { ...GENERIC_SNACK_FALLBACK, containsPlastic: inferred.containsPlastic },
      matchedQuery,
      confidence: "low",
      score: 0,
      type: "snack",
      inferred: true,
      inferredReason: inferred.reason
    };
  }

  let confidence = "low";
  if (bestScore >= 80) confidence = "high";
  else if (bestScore >= 50) confidence = "medium";

  return { item: bestItem, matchedQuery, confidence, score: bestScore, type: bestType };
}

function riskBadgeClass(risk) {
  const map = {
    Low: "risk-low",
    Medium: "risk-medium",
    High: "risk-high",
    "Very High": "risk-very-high",
    Unknown: "risk-unknown"
  };
  return map[risk] || "risk-unknown";
}

function plasticVerdictClass(verdict) {
  const map = {
    Yes: "plastic-yes",
    Likely: "plastic-likely",
    Possible: "plastic-possible",
    Unlikely: "plastic-unlikely",
    No: "plastic-no",
    Unknown: "plastic-unknown"
  };
  return map[verdict] || "plastic-unknown";
}

function plasticVerdictLabel(verdict) {
  const map = {
    Yes: "Contains Plastic",
    Likely: "Likely Contains Plastic",
    Possible: "May Contain Plastic",
    Unlikely: "Unlikely to Contain Plastic",
    No: "No Plastic Detected",
    Unknown: "Plastic Status Unknown"
  };
  return map[verdict] || "Plastic Status Unknown";
}

function isSnackResult(result, data) {
  return result.type === "snack" || data.containsPlastic !== undefined;
}

function renderResults(result, textQuery, imageFile) {
  const data = result.item || GENERIC_FALLBACK;
  const isFallback = !result.item || result.inferred;
  const showSnackVerdict = isSnackResult(result, data);

  const resultsEl = document.getElementById("results");
  const contentEl = document.getElementById("results-content");

  let matchNote = "";
  if (result.inferred) {
    matchNote = `<p class="match-note">No exact snack match for "<strong>${escapeHtml(textQuery)}</strong>". Verdict estimated from packaging keywords.</p>`;
    if (result.inferredReason) {
      matchNote += `<p class="match-note">${escapeHtml(result.inferredReason)}</p>`;
    }
  } else if (isFallback) {
    matchNote = `<p class="match-note">No exact match found${textQuery ? ` for "<strong>${escapeHtml(textQuery)}</strong>"` : ""}. Showing general guidance.</p>`;
  } else {
    matchNote = `<p class="match-note">Matched: <strong>${escapeHtml(data.name)}</strong> (confidence: ${result.confidence})</p>`;
  }

  if (imageFile && !textQuery) {
    matchNote += `<p class="match-note">Analysis based on image filename. For better results, also type the snack name.</p>`;
  }

  const plasticVerdictHtml = showSnackVerdict && data.containsPlastic ? `
      <div class="result-section plastic-verdict ${plasticVerdictClass(data.containsPlastic)}">
        <h3>Does This Snack Contain Plastic?</h3>
        <span class="plastic-badge ${plasticVerdictClass(data.containsPlastic)}">${escapeHtml(plasticVerdictLabel(data.containsPlastic))}</span>
        <p>${escapeHtml(data.containsPlasticDetail || "")}</p>
        ${data.plasticSources ? `
        <h4>Plastic Sources</h4>
        <ul>${data.plasticSources.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
        ` : ""}
      </div>
  ` : "";

  contentEl.innerHTML = `
    ${matchNote}
    <div class="result-card">
      <h2>${escapeHtml(data.name)}</h2>

      ${plasticVerdictHtml}

      <div class="result-section">
        <h3>Microplastic Risk</h3>
        <span class="risk-badge ${riskBadgeClass(data.microplasticRisk)}">${escapeHtml(data.microplasticRisk)}</span>
        <p>${escapeHtml(data.microplasticRiskDetail)}</p>
      </div>

      <div class="result-section">
        <h3>Better Alternatives</h3>
        <ul>${data.betterAlternatives.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
      </div>

      <div class="result-section">
        <h3>How Long It Lasts</h3>
        <p>${escapeHtml(data.howLongItLasts)}</p>
      </div>

      <div class="result-section">
        <h3>Environmental Impact</h3>
        <p>${escapeHtml(data.environmentalImpact)}</p>
      </div>

      <div class="result-section">
        <h3>Potential Impact</h3>
        <p>${escapeHtml(data.potentialImpact)}</p>
      </div>

      <div class="result-section fun-fact">
        <h3>Fun Fact</h3>
        <p>${escapeHtml(data.funFact)}</p>
      </div>
    </div>
  `;

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showImagePreview(file) {
  const preview = document.getElementById("image-preview");
  const img = document.getElementById("preview-img");

  if (!file) {
    preview.hidden = true;
    img.src = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
    preview.hidden = false;
  };
  reader.readAsDataURL(file);
}

function renderSuggestions() {
  const list = document.getElementById("suggestions");
  const samples = ["Chewing gum", "Potato chips", "Fresh apple", "Instant ramen", "Microwave popcorn", "Banana"];
  list.innerHTML = samples
    .map((s) => `<button type="button" class="suggestion-btn" data-item="${escapeHtml(s)}">${escapeHtml(s)}</button>`)
    .join("");

  list.querySelectorAll(".suggestion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("item-input").value = btn.dataset.item;
      runAnalysis();
    });
  });
}

function runAnalysis() {
  const textQuery = document.getElementById("item-input").value;
  const imageFile = document.getElementById("image-input").files[0];

  if (!textQuery.trim() && !imageFile) {
    alert("Please enter an item name or upload an image.");
    return;
  }

  const result = analyzeItem(textQuery, imageFile);
  renderResults(result, textQuery, imageFile);
}

document.addEventListener("DOMContentLoaded", () => {
  renderSuggestions();

  document.getElementById("analyze-btn").addEventListener("click", runAnalysis);

  document.getElementById("item-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runAnalysis();
    }
  });

  document.getElementById("image-input").addEventListener("change", (e) => {
    showImagePreview(e.target.files[0]);
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    document.getElementById("item-input").value = "";
    document.getElementById("image-input").value = "";
    showImagePreview(null);
    document.getElementById("results").hidden = true;
  });
});

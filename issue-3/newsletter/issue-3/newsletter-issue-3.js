(function () {
  const dataNode = document.getElementById("newsletter-data");
  if (!dataNode) {
    return;
  }

  let data;
  try {
    data = JSON.parse(dataNode.textContent);
  } catch (error) {
    console.error("Unable to parse newsletter data JSON.", error);
    return;
  }

  const placeholderPattern = /\{\{[^}]+\}\}/;

  function isPlaceholder(value) {
    return typeof value === "string" && placeholderPattern.test(value.trim());
  }

  function isMeaningful(value) {
    if (Array.isArray(value)) {
      return value.some(isMeaningful);
    }

    if (value && typeof value === "object") {
      return Object.values(value).some(isMeaningful);
    }

    return typeof value === "string" && value.trim() !== "" && !isPlaceholder(value);
  }

  function normalizeText(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  }

  function ensureArray(value) {
    if (Array.isArray(value)) {
      return value.filter(isMeaningful);
    }

    if (isMeaningful(value)) {
      return [value];
    }

    return [];
  }

  function paragraphHTML(paragraphs) {
    return ensureArray(paragraphs)
      .map(function (paragraph) {
        return "<p>" + escapeHTML(paragraph) + "</p>";
      })
      .join("");
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setText(id, value, options) {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }

    const settings = options || {};
    if (!isMeaningful(value)) {
      if (settings.hideIfEmpty) {
        node.classList.add("is-hidden");
      }
      return;
    }

    if (settings.prefix) {
      node.textContent = settings.prefix + normalizeText(value);
      return;
    }

    node.textContent = normalizeText(value);
  }

  function setHTML(id, paragraphs, hideIfEmpty) {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }

    const html = paragraphHTML(paragraphs);
    if (!html) {
      if (hideIfEmpty) {
        node.classList.add("is-hidden");
      }
      return;
    }

    node.innerHTML = html;
  }

  function renderTopicTags(tags) {
    const container = document.getElementById("topic-tags");
    if (!container) {
      return;
    }

    const items = ensureArray(tags);
    container.innerHTML = items
      .map(function (tag) {
        return '<span class="topic-tag">' + escapeHTML(tag) + "</span>";
      })
      .join("");
  }

  function renderStrategies(strategies) {
    const container = document.getElementById("strategy-list");
    if (!container) {
      return;
    }

    const items = ensureArray(strategies).filter(function (strategy) {
      return strategy && typeof strategy === "object" && isMeaningful(strategy.name);
    });

    container.innerHTML = items
      .map(function (strategy) {
        const description = paragraphHTML(strategy.description);
        const tryThis = isMeaningful(strategy.tryThis)
          ? '<div class="try-this">Try this: ' + escapeHTML(strategy.tryThis) + "</div>"
          : "";

        return [
          '<article class="strategy-item">',
          '<div class="strategy-name">' + escapeHTML(strategy.name) + "</div>",
          description,
          tryThis,
          "</article>"
        ].join("");
      })
      .join("");
  }

  function renderRatings(ratings) {
    const container = document.getElementById("tool-rating");
    if (!container || !ratings || typeof ratings !== "object") {
      return;
    }

    const config = [
      ["Research Backing", ratings.researchBacking],
      ["Ease of Adoption", ratings.easeOfAdoption],
      ["Depth of Impact", ratings.depthOfImpact]
    ];

    container.innerHTML = config
      .map(function (entry) {
        return [
          '<div class="rating-row">',
          '<span class="rating-label">' + escapeHTML(entry[0]) + "</span>",
          '<span class="rating-stars">' + escapeHTML(renderStars(entry[1])) + "</span>",
          "</div>"
        ].join("");
      })
      .join("");
  }

  function renderStars(value) {
    if (typeof value === "number" && value >= 0 && value <= 5) {
      return "\u2605".repeat(value) + "\u2606".repeat(5 - value);
    }

    const normalized = normalizeText(value);
    if (/^[1-5]$/.test(normalized)) {
      const amount = Number(normalized);
      return "\u2605".repeat(amount) + "\u2606".repeat(5 - amount);
    }

    if (normalized) {
      return normalized;
    }

    return "{{RATING}}";
  }

  function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    const listItems = ensureArray(items);
    container.innerHTML = listItems
      .map(function (item) {
        return "<li>" + escapeHTML(item) + "</li>";
      })
      .join("");
  }

  function renderQuickReads(items) {
    const container = document.getElementById("quick-reads-list");
    if (!container) {
      return;
    }

    const list = ensureArray(items).filter(function (item) {
      return item && typeof item === "object" && isMeaningful(item.title);
    });

    container.innerHTML = list
      .map(function (item) {
        const sourceLabel = isMeaningful(item.sourceLabel) ? item.sourceLabel : "Source";
        const href = isMeaningful(item.url) ? escapeHTML(item.url) : "#";
        return [
          '<article class="quick-read-item">',
          '<span class="qr-tag">' + escapeHTML(item.tag || "ITEM") + "</span>",
          '<span class="qr-title">' + escapeHTML(item.title) + "</span>",
          '<p class="qr-desc">' + escapeHTML(item.description || "") + "</p>",
          '<a class="qr-link" href="' + href + '">' + escapeHTML(sourceLabel) + " -&gt;</a>",
          "</article>"
        ].join("");
      })
      .join("");
  }

  function renderReferences(items) {
    const container = document.getElementById("references-list");
    if (!container) {
      return;
    }

    const list = ensureArray(items);
    container.innerHTML = list
      .map(function (item) {
        return "<li>" + escapeHTML(item) + "</li>";
      })
      .join("");
  }

  function inferSeriesName(series, fallback) {
    if (isMeaningful(fallback)) {
      return fallback;
    }

    const normalized = normalizeText(series).toUpperCase();
    const map = {
      WP: "The Weekly Proof",
      PD: "The Practitioner's Digest",
      TR: "The Trend Radar"
    };

    return map[normalized] || normalizeText(series) || "{{SERIES_NAME}}";
  }

  function inferSeriesCode(series, explicitName, explicitCode) {
    if (isMeaningful(explicitCode)) {
      return normalizeText(explicitCode).toUpperCase();
    }

    const normalizedSeries = normalizeText(series).toUpperCase();
    if (normalizedSeries === "WP" || normalizedSeries === "PD" || normalizedSeries === "TR") {
      return normalizedSeries;
    }

    const inferredName = normalizeText(explicitName).toLowerCase();
    if (inferredName === "the weekly proof") {
      return "WP";
    }
    if (inferredName === "the practitioner's digest") {
      return "PD";
    }
    if (inferredName === "the trend radar") {
      return "TR";
    }

    return "{{SERIES_CODE}}";
  }

  function formatComplexity(value) {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized === "discover" || normalized === "\u25ce discover") {
      return "\u25ce Discover";
    }
    if (normalized === "deepen" || normalized === "\u25c9 deepen") {
      return "\u25c9 Deepen";
    }
    if (normalized === "master" || normalized === "\u2b24 master") {
      return "\u2b24 Master";
    }

    return normalizeText(value) || "{{COMPLEXITY_LEVEL}}";
  }

  function extractYear(issueDate) {
    const normalized = normalizeText(issueDate);
    const match = normalized.match(/(19|20)\d{2}/);
    if (match) {
      return match[0];
    }

    return String(new Date().getFullYear());
  }

  function collectWordSource() {
    const sections = [
      document.getElementById("opening-letter-section"),
      document.getElementById("main-feature-section"),
      document.getElementById("field-notes-section"),
      document.getElementById("toolbox-section"),
      document.getElementById("quick-reads-section"),
      document.getElementById("glossary-section")
    ];

    return sections
      .filter(Boolean)
      .map(function (section) {
        return section.innerText || "";
      })
      .join(" ");
  }

  function estimateReadingTime() {
    const wordSource = collectWordSource();
    if (placeholderPattern.test(wordSource)) {
      return "{{READING_TIME}}";
    }

    const words = wordSource
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (!words) {
      return "{{READING_TIME}}";
    }

    return "\u2248 " + Math.max(1, Math.ceil(words / 230)) + " min read";
  }

  function autoPullQuote(feature) {
    if (isMeaningful(feature.pullQuote)) {
      return normalizeText(feature.pullQuote);
    }

    const corpus = []
      .concat(ensureArray(feature.opening))
      .concat(ensureArray(feature.lensOneParagraphs))
      .concat(ensureArray(feature.lensTwoParagraphs))
      .concat(ensureArray(feature.lensThreeParagraphs))
      .concat(ensureArray(feature.synthesis))
      .join(" ");

    const sentences = corpus
      .split(/(?<=[.!?])\s+/)
      .map(normalizeText)
      .filter(function (sentence) {
        return sentence.length > 40 && sentence.length < 220;
      });

    return sentences[0] || "{{FEATURE_PULLQUOTE}}";
  }

  const seriesName = inferSeriesName(data.series, data.seriesName);
  const seriesCode = inferSeriesCode(data.series, seriesName, data.seriesCode);
  const complexity = formatComplexity(data.complexity);
  const issueYear = extractYear(data.issueDate);

  setText("series-name", seriesName);
  setText("issue-tagline", data.tagline);
  setText("meta-issue", data.issueNumber, { prefix: "Issue #" });
  setText("meta-date", data.issueDate);
  setText(
    "meta-series",
    isMeaningful(seriesCode) ? seriesName + " \u00b7 Series " + seriesCode : seriesName
  );
  setText("meta-level", complexity);
  renderTopicTags(data.topicTags);
  setHTML("opening-letter", data.openingLetter);
  setText("editor-signature", data.editorName, { prefix: "\u2014 " });

  setText("feature-title", data.feature && data.feature.title);
  setText("feature-deck", data.feature && data.feature.deck);
  setHTML("feature-opening", data.feature && data.feature.opening);
  setText("lens-one-label", data.feature && data.feature.lensOneLabel);
  setText("lens-one-heading", data.feature && data.feature.lensOneHeading);
  setHTML("lens-one-copy", data.feature && data.feature.lensOneParagraphs);
  setText("pull-quote", data.feature ? autoPullQuote(data.feature) : "{{FEATURE_PULLQUOTE}}");
  setText("lens-two-label", data.feature && data.feature.lensTwoLabel);
  setText("lens-two-heading", data.feature && data.feature.lensTwoHeading);
  setHTML("lens-two-copy", data.feature && data.feature.lensTwoParagraphs);
  setText("lens-three-label", data.feature && data.feature.lensThreeLabel);
  setText("lens-three-heading", data.feature && data.feature.lensThreeHeading);
  setHTML("lens-three-copy", data.feature && data.feature.lensThreeParagraphs);
  setHTML("feature-synthesis", data.feature && data.feature.synthesis);

  setText("proof-citation", data.alphaProof && data.alphaProof.citation);
  setHTML("proof-gloss", data.alphaProof && data.alphaProof.gloss);
  setText("proof-tag", data.alphaProof && data.alphaProof.complexity, { prefix: "Source accessibility: " });

  setText("field-level", data.fieldNotes && data.fieldNotes.level, { hideIfEmpty: true });
  setHTML("field-context", data.fieldNotes && data.fieldNotes.context);
  renderStrategies(data.fieldNotes && data.fieldNotes.strategies);
  setText("field-limitations", data.fieldNotes && data.fieldNotes.limitations);

  setText("alpha-question", data.alphaQuestion);

  setText("tool-type", data.toolbox && data.toolbox.type);
  setText("tool-name", data.toolbox && data.toolbox.name);
  setText("tool-oneliner", data.toolbox && data.toolbox.oneLiner);
  setHTML("tool-review", data.toolbox && data.toolbox.review);
  renderList("tool-best-for-list", data.toolbox && data.toolbox.bestUsedFor);
  renderList("tool-limitations-list", data.toolbox && data.toolbox.limitations);
  renderRatings(data.toolbox && data.toolbox.ratings);

  const toolUrlNode = document.getElementById("tool-url");
  if (toolUrlNode && data.toolbox) {
    const rawUrl = normalizeText(data.toolbox.url);
    const urlHref = normalizeText(data.toolbox.urlHref || rawUrl);
    const urlLabel = normalizeText(data.toolbox.urlLabel || rawUrl);

    if (urlLabel) {
      toolUrlNode.textContent = urlLabel;
    }

    if (urlHref) {
      toolUrlNode.href = urlHref;
    } else {
      toolUrlNode.removeAttribute("href");
    }
  }

  renderQuickReads(data.quickReads);

  setText("glossary-term", data.glossary && data.glossary.term);
  setText("glossary-pronunciation", data.glossary && data.glossary.pronunciation, { hideIfEmpty: true });
  setText("glossary-field", data.glossary && data.glossary.field);
  setHTML("glossary-definition", data.glossary && data.glossary.definition);
  setHTML("glossary-etymology", data.glossary && data.glossary.etymology);
  setHTML("glossary-classroom", data.glossary && data.glossary.classroom);
  setHTML("glossary-confused", data.glossary && data.glossary.confusedWith);
  setHTML("glossary-reference", data.glossary && data.glossary.reference);

  renderReferences(data.references);

  setText("footer-contact", data.footerContact);
  setText("footer-note", data.footerNote);
  setText("footer-legal", issueYear + " Alphaducation \u00b7 Alpha-Library", { prefix: "\u00a9 " });

  const footerLinks = data.footerLinks || {};
  const footerMappings = [
    ["Archive", footerLinks.archive],
    ["Toolbox", footerLinks.toolbox],
    ["Workshops", footerLinks.workshops],
    ["Web-Books", footerLinks.webBooks],
    ["Community", footerLinks.community]
  ];

  document.querySelectorAll(".footer-nav a").forEach(function (link) {
    const match = footerMappings.find(function (entry) {
      return entry[0] === link.textContent.trim();
    });

    if (match && isMeaningful(match[1])) {
      link.href = normalizeText(match[1]);
    }
  });

  const unsubLink = document.querySelector(".footer-unsub a");
  if (unsubLink && isMeaningful(footerLinks.unsubscribe)) {
    unsubLink.href = normalizeText(footerLinks.unsubscribe);
  }

  setText("meta-read", estimateReadingTime());

  if (isMeaningful(data.issueNumber) || isMeaningful(data.feature && data.feature.title)) {
    document.title = [
      "Alphaducation",
      seriesName,
      isMeaningful(data.issueNumber) ? "Issue #" + normalizeText(data.issueNumber) : "",
      isMeaningful(data.feature && data.feature.title) ? normalizeText(data.feature.title) : ""
    ].filter(Boolean).join(" \u00b7 ");
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && isMeaningful(data.feature && data.feature.deck)) {
    metaDescription.setAttribute(
      "content",
      "Alphaducation Newsletter - " + seriesName + " - " + normalizeText(data.feature.deck)
    );
  }

  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const updateProgress = function () {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const amount = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      progressBar.style.width = amount + "%";
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }
}());

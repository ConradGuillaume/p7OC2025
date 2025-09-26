// App (Version 2) — Boucles natives seulement: recherche + tags + pagination + debug

var RECIPES_PER_PAGE = 9;
var currentPage = 1;

// Source de données (compat: `recipes` OU `window.RECIPES`)
var allRecipes =
  (typeof recipes !== "undefined" && recipes && recipes.length
    ? recipes
    : []) ||
  (typeof window !== "undefined" && window.RECIPES && window.RECIPES.length
    ? window.RECIPES
    : []);

var currentRecipes = allRecipes.slice ? allRecipes.slice() : allRecipes;

// État des tags
var selectedIngredientTags = [];
var selectedApplianceTags = [];
var selectedUtensilTags = [];

/* Fonction: createDebugPanel
   Rôle: Créer un petit panneau flottant pour logs UI */
function createDebugPanel() {
  var panel = document.getElementById("debug-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.position = "fixed";
    panel.style.right = "12px";
    panel.style.bottom = "12px";
    panel.style.zIndex = "9999";
    panel.style.maxWidth = "360px";
    panel.style.fontSize = "13px";
    panel.style.fontFamily =
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
    panel.style.color = "#111";
    document.body.appendChild(panel);
  }
  return panel;
}

/* Fonction: debug
   Rôle: Afficher un message dans la console et dans le panneau UI */
function debug(msg, isError) {
  var panel = createDebugPanel();
  var line = document.createElement("div");
  line.textContent = msg;
  line.style.background = isError
    ? "rgba(255,200,200,0.95)"
    : "rgba(240,240,240,0.95)";
  line.style.padding = "6px 8px";
  line.style.marginTop = "6px";
  line.style.borderRadius = "6px";
  panel.appendChild(line);
  if (isError) {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

/* Fonction: escapeHtml
   Rôle: Échapper les caractères HTML */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  var s = String(str);
  return s.replace(/[&<>"]+/g, function (c) {
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    return c;
  });
}

/* Fonction: displayRecipes
   Rôle: Rendre les cartes recettes + compteur + pagination + gestion no-results */
function displayRecipes(recipesToDisplay, page) {
  var grid = document.getElementById("recipes-grid");
  var noRes = document.getElementById("no-results");
  if (!grid) {
    debug("Élément #recipes-grid introuvable", true);
    return;
  }
  if (!page) page = 1;

  grid.innerHTML = "";
  var start = (page - 1) * RECIPES_PER_PAGE;
  var end = start + RECIPES_PER_PAGE;

  var pageRecipes = [];
  for (var i = start; i < end && i < recipesToDisplay.length; i++) {
    pageRecipes[pageRecipes.length] = recipesToDisplay[i];
  }

  if (!pageRecipes.length) {
    if (noRes) noRes.style.display = "block";
    updateCount(0);
    updatePagination(recipesToDisplay.length, page);
    return;
  } else {
    if (noRes) noRes.style.display = "none";
  }

  for (var r = 0; r < pageRecipes.length; r++) {
    var recipe = pageRecipes[r];
    var card = document.createElement("div");
    card.className = "col card-recipe";

    var ingredientsHtml = "";
    if (recipe.ingredients && recipe.ingredients.length) {
      for (var k = 0; k < recipe.ingredients.length; k++) {
        var ing = recipe.ingredients[k];
        ingredientsHtml += "<li>" + escapeHtml(ing.ingredient || "");
        if (ing.quantity || ing.quantity === 0)
          ingredientsHtml += " : " + escapeHtml(String(ing.quantity));
        if (ing.unit) ingredientsHtml += " " + escapeHtml(ing.unit);
        ingredientsHtml += "</li>";
      }
    }

    card.innerHTML =
      '<div class="card h-100 position-relative">' +
      '  <img src="images/' +
      escapeHtml(recipe.image) +
      '" alt="' +
      escapeHtml(recipe.name) +
      '" class="card-img-top" loading="lazy">' +
      '  <span class="badge rounded-pill position-absolute">' +
      escapeHtml(String(recipe.time || 0)) +
      "min</span>" +
      '  <div class="card-body">' +
      '    <h5 class="card-title">' +
      escapeHtml(recipe.name) +
      "</h5>" +
      '    <div class="section-title">Recette</div>' +
      '    <p class="card-text">' +
      escapeHtml(recipe.description || "") +
      "</p>" +
      '    <div class="ingredients mb-2">' +
      "      <strong>Ingrédients :</strong>" +
      '      <ul class="mb-0">' +
      ingredientsHtml +
      "</ul>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    var imgEl = card.querySelector("img");
    (function (recipeRef, imgRef) {
      imgRef.addEventListener("error", function () {
        debug("Image introuvable: images/" + recipeRef.image, true);
        imgRef.src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666">Image manquante</text></svg>'
          );
      });
    })(recipe, imgEl);

    grid.appendChild(card);
  }

  updateCount(recipesToDisplay.length);
  updatePagination(recipesToDisplay.length, page);
}

/* Fonction: updatePagination
   Rôle: Construire / mettre à jour la pagination et binder les clics */
function updatePagination(total, page) {
  var pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("nav");
    pagination.id = "pagination";
    pagination.className = "w-100 d-flex justify-content-center mt-4";
    var mainContainer = document.querySelector("main.container");
    if (mainContainer) mainContainer.appendChild(pagination);
  }

  var totalPages = Math.max(1, Math.ceil(total / RECIPES_PER_PAGE));
  var ul = document.createElement("ul");
  ul.className = "pagination";

  for (var i = 1; i <= totalPages; i++) {
    var li = document.createElement("li");
    li.className = "page-item" + (i === page ? " active" : "");
    var btn = document.createElement("button");
    btn.className = "page-link";
    btn.type = "button";
    btn.setAttribute("data-page", String(i));
    btn.textContent = String(i);
    (function (iRef) {
      btn.addEventListener("click", function () {
        currentPage = iRef;
        displayRecipes(currentRecipes, currentPage);
      });
    })(i);
    li.appendChild(btn);
    ul.appendChild(li);
  }
  pagination.innerHTML = "";
  pagination.appendChild(ul);
}

/* Fonction: updateCount
   Rôle: Mettre à jour le compteur de recettes */
function updateCount(n) {
  var el = document.getElementById("recipes-count");
  if (el) el.textContent = n + " recette" + (n > 1 ? "s" : "");
}

/* Fonction: getSearchOptions
   Rôle: Construire l’objet d’options pour loopSearch */
function getSearchOptions() {
  var input = document.getElementById("main-search");
  var query = input ? input.value || "" : "";
  return {
    data: allRecipes,
    query: query,
    ingredientTags: selectedIngredientTags,
    applianceTags: selectedApplianceTags,
    utensilTags: selectedUtensilTags,
  };
}

/* Fonction: computeFacetsLoops
   Rôle: Calculer les facettes (ingrédients/appareils/ustensiles) depuis une liste */
function computeFacetsLoops(list) {
  var ingMap = {};
  var appMap = {};
  var ustMap = {};

  for (var i = 0; i < list.length; i++) {
    var r = list[i];

    if (r && r.ingredients && r.ingredients.length) {
      for (var j = 0; j < r.ingredients.length; j++) {
        var rawIng =
          r.ingredients[j] && r.ingredients[j].ingredient
            ? r.ingredients[j].ingredient
            : "";
        var keyIng = loopNormalize(rawIng);
        if (rawIng) ingMap[keyIng] = rawIng;
      }
    }

    if (r && r.appliance) {
      var keyApp = loopNormalize(r.appliance);
      appMap[keyApp] = r.appliance;
    }

    if (r && r.ustensils && r.ustensils.length) {
      for (var u = 0; u < r.ustensils.length; u++) {
        var rawU = r.ustensils[u];
        var keyU = loopNormalize(rawU);
        if (rawU) ustMap[keyU] = rawU;
      }
    }
  }

  // Convertir en tableaux triés (alphabétique insensible à la casse)
  function toSortedEntries(obj) {
    var arr = [];
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        arr[arr.length] = [k, obj[k]];
      }
    }
    // tri simple
    for (var a = 0; a < arr.length - 1; a++) {
      for (var b = a + 1; b < arr.length; b++) {
        if (
          String(arr[a][1]).localeCompare(String(arr[b][1]), "fr", {
            sensitivity: "base",
          }) > 0
        ) {
          var tmp = arr[a];
          arr[a] = arr[b];
          arr[b] = tmp;
        }
      }
    }
    return arr;
  }

  return {
    ingredients: toSortedEntries(ingMap),
    appliances: toSortedEntries(appMap),
    utensils: toSortedEntries(ustMap),
  };
}

/* Fonction: renderDropdown
   Rôle: Injecter les options dans un <ul> pour un type donné */
function renderDropdown(ulId, entries, type) {
  var ul = document.getElementById(ulId);
  if (!ul) return;

  var selectedSet = {};
  var arr =
    type === "ingredient"
      ? selectedIngredientTags
      : type === "appliance"
      ? selectedApplianceTags
      : selectedUtensilTags;

  for (var s = 0; s < arr.length; s++) {
    selectedSet[loopNormalize(arr[s])] = true;
  }

  var html = "";
  if (!entries.length) {
    html =
      '<li><span class="dropdown-item text-muted" aria-disabled="true">Aucune option</span></li>';
  } else {
    for (var i = 0; i < entries.length; i++) {
      var key = entries[i][0];
      var display = entries[i][1];
      var isSel = !!selectedSet[key];
      html +=
        "<li>" +
        '  <button class="dropdown-item d-flex justify-content-between align-items-center" ' +
        '          data-type="' +
        type +
        '" data-value="' +
        escapeHtml(display) +
        '" ' +
        (isSel ? "disabled" : "") +
        ">" +
        "    <span>" +
        escapeHtml(display) +
        "</span>" +
        (isSel
          ? '<span class="badge text-bg-secondary">sélectionné</span>'
          : "") +
        "  </button>" +
        "</li>";
    }
  }
  ul.innerHTML = html;

  var buttons = ul.querySelectorAll("button.dropdown-item");
  for (var b = 0; b < buttons.length; b++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var typeAttr = btn.getAttribute("data-type");
        var val = btn.getAttribute("data-value");
        addTag(typeAttr, val);
      });
    })(buttons[b]);
  }
}

/* Fonction: renderSelectedTags
   Rôle: Afficher les badges des tags sélectionnés et gérer leur retrait */
function renderSelectedTags() {
  var zone = document.getElementById("selected-tags");
  if (!zone) return;

  var html = "";
  var i;

  for (i = 0; i < selectedIngredientTags.length; i++) {
    html +=
      '<span class="badge rounded-pill text-bg-primary d-inline-flex align-items-center" style="gap:6px">' +
      "  <span>" +
      escapeHtml(selectedIngredientTags[i]) +
      "</span>" +
      '  <button type="button" class="btn-close btn-close-white" aria-label="Retirer" ' +
      '          data-remove-type="ingredient" data-remove-value="' +
      escapeHtml(selectedIngredientTags[i]) +
      '"></button>' +
      "</span> ";
  }
  for (i = 0; i < selectedApplianceTags.length; i++) {
    html +=
      '<span class="badge rounded-pill text-bg-primary d-inline-flex align-items-center" style="gap:6px">' +
      "  <span>" +
      escapeHtml(selectedApplianceTags[i]) +
      "</span>" +
      '  <button type="button" class="btn-close btn-close-white" aria-label="Retirer" ' +
      '          data-remove-type="appliance" data-remove-value="' +
      escapeHtml(selectedApplianceTags[i]) +
      '"></button>' +
      "</span> ";
  }
  for (i = 0; i < selectedUtensilTags.length; i++) {
    html +=
      '<span class="badge rounded-pill text-bg-primary d-inline-flex align-items-center" style="gap:6px">' +
      "  <span>" +
      escapeHtml(selectedUtensilTags[i]) +
      "</span>" +
      '  <button type="button" class="btn-close btn-close-white" aria-label="Retirer" ' +
      '          data-remove-type="utensil" data-remove-value="' +
      escapeHtml(selectedUtensilTags[i]) +
      '"></button>' +
      "</span> ";
  }

  zone.innerHTML = html;

  var closeBtns = zone.querySelectorAll("button[data-remove-type]");
  for (var c = 0; c < closeBtns.length; c++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var type = btn.getAttribute("data-remove-type");
        var val = btn.getAttribute("data-remove-value");
        removeTag(type, val);
      });
    })(closeBtns[c]);
  }
}

/* Fonction: addTag
   Rôle: Ajouter un tag et relancer la recherche */
function addTag(type, value) {
  if (!value) return;
  if (type === "ingredient") {
    if (!containsValue(selectedIngredientTags, value))
      selectedIngredientTags[selectedIngredientTags.length] = value;
  } else if (type === "appliance") {
    if (!containsValue(selectedApplianceTags, value))
      selectedApplianceTags[selectedApplianceTags.length] = value;
  } else if (type === "utensil") {
    if (!containsValue(selectedUtensilTags, value))
      selectedUtensilTags[selectedUtensilTags.length] = value;
  }
  runSearch();
}

/* Fonction: removeTag
   Rôle: Retirer un tag et relancer la recherche */
function removeTag(type, value) {
  if (!value) return;

  function removeFrom(arr, val) {
    var next = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== val) next[next.length] = arr[i];
    }
    return next;
  }

  if (type === "ingredient")
    selectedIngredientTags = removeFrom(selectedIngredientTags, value);
  else if (type === "appliance")
    selectedApplianceTags = removeFrom(selectedApplianceTags, value);
  else if (type === "utensil")
    selectedUtensilTags = removeFrom(selectedUtensilTags, value);

  runSearch();
}

/* Fonction: containsValue
   Rôle: Vérifier présence d’une valeur (insensible à la casse/accents) dans un tableau */
function containsValue(arr, val) {
  var target = loopNormalize(val);
  for (var i = 0; i < arr.length; i++) {
    if (loopNormalize(arr[i]) === target) return true;
  }
  return false;
}

/* Fonction: getNoResultsMessage
   Rôle: Adapter le message “aucun résultat” selon la requête */
function getNoResultsMessage(query) {
  var msgEl = document.getElementById("no-results-message");
  if (!msgEl) return;
  var q = (query || "").trim();
  msgEl.textContent =
    q.length >= 3
      ? "Aucune recette trouvée pour « " +
        q +
        " ». Essayez d'autres mots-clés ou tags."
      : "Saisissez au moins 3 caractères pour lancer une recherche.";
}

/* Fonction: refreshFacetsUI
   Rôle: Recalculer les facettes et mettre à jour dropdowns + badges */
function refreshFacetsUI(results) {
  var facets = computeFacetsLoops(results);
  renderDropdown("ingredients-list", facets.ingredients, "ingredient");
  renderDropdown("appliances-list", facets.appliances, "appliance");
  renderDropdown("utensils-list", facets.utensils, "utensil");
  renderSelectedTags();
}

/* Fonction: runSearch
   Rôle: Exécuter la recherche (boucles), rafraîchir liste, facettes et messages */
function runSearch() {
  var opts = getSearchOptions();
  var q = (opts.query || "").trim();

  // UX: < 3 chars et aucun tag -> afficher tout + facettes complètes
  if (
    q.length < 3 &&
    !selectedIngredientTags.length &&
    !selectedApplianceTags.length &&
    !selectedUtensilTags.length
  ) {
    currentRecipes = allRecipes.slice ? allRecipes.slice() : allRecipes;
    currentPage = 1;
    displayRecipes(currentRecipes, currentPage);
    refreshFacetsUI(currentRecipes);
    var noRes = document.getElementById("no-results");
    if (noRes) noRes.style.display = "block";
    getNoResultsMessage(q);
    return;
  }

  var results = loopSearch(opts);
  currentRecipes = results;
  currentPage = 1;
  displayRecipes(currentRecipes, currentPage);
  refreshFacetsUI(currentRecipes);

  var noRes2 = document.getElementById("no-results");
  if (noRes2) noRes2.style.display = results.length ? "none" : "block";
  getNoResultsMessage(q);
}

/* Fonction: bindSearchUI
   Rôle: Brancher la soumission et la frappe en live sur la barre principale */
function bindSearchUI() {
  var form = document.getElementById("search-form");
  var input = document.getElementById("main-search");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      runSearch();
    });
  }
  if (input) {
    input.addEventListener("keyup", function () {
      runSearch();
    });
  }
}

/* Fonction: initHeroImage
   Rôle: Définir l’image hero depuis la première recette si possible */
function initHeroImage() {
  try {
    var heroImg = document.getElementById("hero-img");
    if (
      heroImg &&
      currentRecipes &&
      currentRecipes[0] &&
      currentRecipes[0].image
    ) {
      heroImg.src = "images/" + currentRecipes[0].image;
    }
  } catch (e) {
    debug(
      "Impossible de définir l'image hero dynamiquement: " + e.message,
      true
    );
  }
}

/* Fonction: initApp
   Rôle: Initialiser l’application (données, rendu initial, UI recherche/tags) */
function initApp() {
  try {
    if (!allRecipes || !allRecipes.length) {
      debug(
        "Avertissement: aucune recette détectée. Vérifie que `recipes` (ou `window.RECIPES`) est défini avant `app.js`.",
        true
      );
    } else {
      debug("Nombre de recettes détectées: " + allRecipes.length);
    }

    currentRecipes = allRecipes.slice ? allRecipes.slice() : allRecipes;
    displayRecipes(currentRecipes, 1);
    refreshFacetsUI(currentRecipes);
    initHeroImage();
    bindSearchUI();
  } catch (err) {
    debug(
      "Erreur lors de l'initialisation: " +
        (err && err.message ? err.message : String(err)),
      true
    );
    if (console && console.error) console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", initApp);

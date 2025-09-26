// Point d'entrée principal
// Affichage des recettes + diagnostics si rien ne s'affiche
const RECIPES_PER_PAGE = 9;
let currentPage = 1;
let currentRecipes =
  typeof recipes !== "undefined" && Array.isArray(recipes) ? recipes : [];

function createDebugPanel() {
  let panel = document.getElementById("debug-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.position = "fixed";
    panel.style.right = "12px";
    panel.style.bottom = "12px";
    panel.style.zIndex = "9999";
    panel.style.maxWidth = "320px";
    panel.style.fontSize = "13px";
    document.body.appendChild(panel);
  }
  return panel;
}

function debug(msg, isError = false) {
  const panel = createDebugPanel();
  const line = document.createElement("div");
  line.textContent = msg;
  line.style.background = isError
    ? "rgba(255,200,200,0.95)"
    : "rgba(240,240,240,0.95)";
  line.style.padding = "6px 8px";
  line.style.marginTop = "6px";
  line.style.borderRadius = "6px";
  panel.appendChild(line);
  console[isError ? "error" : "log"](msg);
}

function displayRecipes(recipesToDisplay, page = 1) {
  const grid = document.getElementById("recipes-grid");
  if (!grid) {
    debug("Élément #recipes-grid introuvable dans le DOM", true);
    return;
  }
  grid.innerHTML = "";
  const start = (page - 1) * RECIPES_PER_PAGE;
  const end = start + RECIPES_PER_PAGE;
  const pageRecipes = recipesToDisplay.slice(start, end);

  if (pageRecipes.length === 0) {
    document.getElementById("no-results").style.display = "block";
    debug("Aucune recette à afficher pour cette page.");
    return;
  } else {
    document.getElementById("no-results").style.display = "none";
  }

  pageRecipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "col card-recipe";
    const ingredientsHtml = (recipe.ingredients || [])
      .map(
        (ing) => `
            <li>${escapeHtml(ing.ingredient)}${
          ing.quantity ? ` : ${escapeHtml(String(ing.quantity))}` : ""
        }${ing.unit ? ` ${escapeHtml(ing.unit)}` : ""}</li>`
      )
      .join("");
    card.innerHTML = `
            <div class="card h-100 position-relative">
                <img src="images/${recipe.image}" alt="${escapeHtml(
      recipe.name
    )}" class="card-img-top" loading="lazy">
                <span class="badge rounded-pill position-absolute">${escapeHtml(
                  String(recipe.time)
                )}min</span>
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(recipe.name)}</h5>
                    <div class="section-title">Recette</div>
                    <p class="card-text">${escapeHtml(recipe.description)}</p>
                    <div class="ingredients mb-2">
                        <strong>Ingrédients :</strong>
                        <ul class="mb-0">
                            ${ingredientsHtml}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    // Vérifier si l'image se charge
    const imgEl = card.querySelector("img");
    imgEl.addEventListener("error", () => {
      debug(`Image introuvable: images/${recipe.image}`, true);
      imgEl.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666">Image manquante</text></svg>`
        );
    });
    grid.appendChild(card);
  });
  updatePagination(recipesToDisplay.length, page);
}

function updatePagination(total, page) {
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("nav");
    pagination.id = "pagination";
    pagination.className = "w-100 d-flex justify-content-center mt-4";
    document.querySelector("main.container").appendChild(pagination);
  }
  const totalPages = Math.max(1, Math.ceil(total / RECIPES_PER_PAGE));
  let html = '<ul class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${
      i === page ? " active" : ""
    }"><button class="page-link" data-page="${i}" type="button">${i}</button></li>`;
  }
  html += "</ul>";
  pagination.innerHTML = html;
  Array.from(pagination.querySelectorAll("button.page-link")).forEach((btn) => {
    btn.addEventListener("click", function () {
      currentPage = parseInt(this.getAttribute("data-page"));
      displayRecipes(currentRecipes, currentPage);
    });
  });
}

function escapeHtml(str) {
  return str
    ? String(str).replace(/[&<>"]+/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      })
    : "";
}

window.addEventListener("DOMContentLoaded", function () {
  try {
    if (!Array.isArray(currentRecipes) || currentRecipes.length === 0) {
      debug(
        "La variable `recipes` est vide ou introuvable. Vérifie que `recipes.js` est chargé et définit `const recipes = [...]`.",
        true
      );
    } else {
      debug(`Nombre de recettes détectées: ${currentRecipes.length}`);
      // Définir dynamiquement l'image hero à partir de la première recette
      try {
        const heroImg = document.getElementById("hero-img");
        if (heroImg && currentRecipes[0] && currentRecipes[0].image) {
          heroImg.src = "images/" + currentRecipes[0].image;
        }
      } catch (e) {
        debug(
          "Impossible de définir l image hero dynamiquement: " + e.message,
          true
        );
      }
    }
    displayRecipes(currentRecipes, 1);
  } catch (err) {
    debug(
      "Erreur lors de l affichage des recettes: " +
        (err && err.message ? err.message : String(err)),
      true
    );
    console.error(err);
  }
});

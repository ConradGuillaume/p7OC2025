/* Fonction: loopNormalize
   Rôle: Normaliser un texte (minuscules, sans accents) pour la recherche */
function loopNormalize(text) {
  return (text == null ? "" : String(text))
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/* Fonction: loopBuildIndex
   Rôle: Construire la chaîne indexable (nom, description, ingrédients, appareil, ustensiles, portions) */
function loopBuildIndex(recipe) {
  var s = "";
  s += loopNormalize(recipe.name) + " ";
  s += loopNormalize(recipe.description) + " ";

  if (recipe && recipe.ingredients && recipe.ingredients.length) {
    for (var i = 0; i < recipe.ingredients.length; i++) {
      var it = recipe.ingredients[i];
      if (it && it.ingredient) s += loopNormalize(it.ingredient) + " ";
      if (it && it.unit) s += loopNormalize(it.unit) + " ";
    }
  }

  s += loopNormalize(recipe.appliance) + " ";

  if (recipe && recipe.ustensils && recipe.ustensils.length) {
    for (var u = 0; u < recipe.ustensils.length; u++) {
      s += loopNormalize(recipe.ustensils[u]) + " ";
    }
  }

  if (recipe && recipe.servings) s += String(recipe.servings) + " ";

  return s.trim();
}

/* Fonction: loopIncludesAll
   Rôle: Vérifier que toutes les étiquettes sont présentes dans une liste de valeurs */
function loopIncludesAll(tags, values) {
  if (!tags || !tags.length) return true;
  for (var i = 0; i < tags.length; i++) {
    var tag = loopNormalize(tags[i]);
    var found = false;
    for (var j = 0; j < values.length; j++) {
      if (values[j].indexOf(tag) !== -1) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/* Fonction: loopSearch
   Rôle: Filtrer les recettes avec boucles (for/while) selon requête + tags en intersection */
function loopSearch(options) {
  var data = options && options.data ? options.data : [];
  var query = options && options.query ? options.query : "";
  var ingTags = options && options.ingredientTags ? options.ingredientTags : [];
  var appTags = options && options.applianceTags ? options.applianceTags : [];
  var ustTags = options && options.utensilTags ? options.utensilTags : [];

  var q = loopNormalize(query);
  var hasMain = q.length >= 3;

  var out = [];
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var idx = loopBuildIndex(r);

    if (hasMain && idx.indexOf(q) === -1) continue;

    var ingVals = [];
    if (r && r.ingredients && r.ingredients.length) {
      for (var k = 0; k < r.ingredients.length; k++) {
        var ing = r.ingredients[k];
        if (ing && ing.ingredient)
          ingVals[ingVals.length] = loopNormalize(ing.ingredient);
      }
    }
    if (!loopIncludesAll(ingTags, ingVals)) continue;

    var appVals = [];
    if (r && r.appliance) appVals[0] = loopNormalize(r.appliance);
    if (!loopIncludesAll(appTags, appVals)) continue;

    var ustVals = [];
    if (r && r.ustensils && r.ustensils.length) {
      for (var u = 0; u < r.ustensils.length; u++) {
        ustVals[ustVals.length] = loopNormalize(r.ustensils[u]);
      }
    }
    if (!loopIncludesAll(ustTags, ustVals)) continue;

    out[out.length] = r;
  }

  return out;
}

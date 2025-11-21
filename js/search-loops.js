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
  var baseParts = [
    loopNormalize(recipe && recipe.name),
    loopNormalize(recipe && recipe.description),
    loopNormalize(recipe && recipe.appliance),
  ];

  var ingredientParts = ((recipe && recipe.ingredients) || []).reduce(
    function (acc, ing) {
      if (!ing) return acc;
      if (ing.ingredient) acc.push(loopNormalize(ing.ingredient));
      if (ing.unit) acc.push(loopNormalize(ing.unit));
      return acc;
    },
    []
  );

  var utensilParts = ((recipe && recipe.ustensils) || []).map(function (ut) {
    return loopNormalize(ut);
  });

  var servingParts =
    recipe && recipe.servings ? [String(recipe.servings)] : [];

  return baseParts
    .concat(ingredientParts, utensilParts, servingParts)
    .filter(function (part) {
      return part && part.length;
    })
    .join(" ")
    .trim();
}

/* Fonction: loopIncludesAll
   Rôle: Vérifier que toutes les étiquettes sont présentes dans une liste de valeurs */
function loopIncludesAll(tags, values) {
  if (!tags || !tags.length) return true;
  return tags.every(function (tag) {
    var normalizedTag = loopNormalize(tag);
    return values.some(function (value) {
      return value.indexOf(normalizedTag) !== -1;
    });
  });
}

/* Fonction: loopSearch
   Rôle: Filtrer les recettes selon requête + tags en intersection (approche fonctionnelle) */
function loopSearch(options) {
  var data = options && options.data ? options.data : [];
  var query = options && options.query ? options.query : "";
  var ingTags = options && options.ingredientTags ? options.ingredientTags : [];
  var appTags = options && options.applianceTags ? options.applianceTags : [];
  var ustTags = options && options.utensilTags ? options.utensilTags : [];

  var q = loopNormalize(query);
  var hasMain = q.length >= 3;

  return data.filter(function (r) {
    var idx = loopBuildIndex(r);

    if (hasMain && idx.indexOf(q) === -1) return false;

    var ingVals = ((r && r.ingredients) || []).reduce(function (acc, ing) {
      if (ing && ing.ingredient) acc.push(loopNormalize(ing.ingredient));
      return acc;
    }, []);
    if (!loopIncludesAll(ingTags, ingVals)) return false;

    var appVals = r && r.appliance ? [loopNormalize(r.appliance)] : [];
    if (!loopIncludesAll(appTags, appVals)) return false;

    var ustVals = ((r && r.ustensils) || []).map(function (ust) {
      return loopNormalize(ust);
    });
    if (!loopIncludesAll(ustTags, ustVals)) return false;

    return true;
  });
}

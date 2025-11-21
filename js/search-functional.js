// Recherche avec méthodes fonctionnelles
function searchRecipesFunctional(query, recipes, selectedTags) {
  var safeQuery = escapeInput(query || "").trim();
  var hasMainQuery = safeQuery.length >= 3;
  var hasActiveTags = Object.keys(selectedTags || {}).some(function (type) {
    return (
      Array.isArray(selectedTags[type]) && selectedTags[type].length > 0
    );
  });

  if (!hasMainQuery && !hasActiveTags) {
    return recipes.slice ? recipes.slice() : recipes;
  }

  return recipes.filter(function (recipe) {
    return matchesQuery(recipe, safeQuery) && matchesTags(recipe, selectedTags);
  });
}

function matchesQuery(recipe, query) {
  if (!query || query.length < 3) return true;
  var q = query.toLowerCase();
  return (
    recipe.name.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q) ||
    recipe.ingredients.some(function (ing) {
      return ing.ingredient.toLowerCase().includes(q);
    })
  );
}

function matchesTags(recipe, selectedTags) {
  if (!selectedTags) return true;
  return Object.keys(selectedTags).every(function (tagType) {
    return selectedTags[tagType].every(function (tag) {
      return recipeHasTag(recipe, tagType, tag);
    });
  });
}

function recipeHasTag(recipe, tagType, tag) {
  switch (tagType) {
    case "ingredients":
      return recipe.ingredients.some(function (ing) {
        return ing.ingredient.toLowerCase() === tag.toLowerCase();
      });
    case "appliances":
      return (
        recipe.appliance && recipe.appliance.toLowerCase() === tag.toLowerCase()
      );
    case "utensils":
      return recipe.ustensils.some(function (u) {
        return u.toLowerCase() === tag.toLowerCase();
      });
    default:
      return false;
  }
}

function escapeInput(str) {
  return str.replace(/[&<>"]+/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

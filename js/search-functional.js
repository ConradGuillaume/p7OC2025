// Recherche avec méthodes fonctionnelles
function searchRecipesFunctional(query, recipes, selectedTags) {
  query = escapeInput(query);
  return recipes.filter((recipe) => {
    return matchesQuery(recipe, query) && matchesTags(recipe, selectedTags);
  });
}

function matchesQuery(recipe, query) {
  if (query.length < 3) return true;
  const q = query.toLowerCase();
  return (
    recipe.name.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q) ||
    recipe.ingredients.some((ing) => ing.ingredient.toLowerCase().includes(q))
  );
}

function matchesTags(recipe, selectedTags) {
  return Object.keys(selectedTags).every((tagType) =>
    selectedTags[tagType].every((tag) => recipeHasTag(recipe, tagType, tag))
  );
}

function recipeHasTag(recipe, tagType, tag) {
  switch (tagType) {
    case "ingredients":
      return recipe.ingredients.some(
        (ing) => ing.ingredient.toLowerCase() === tag.toLowerCase()
      );
    case "appliances":
      return (
        recipe.appliance && recipe.appliance.toLowerCase() === tag.toLowerCase()
      );
    case "utensils":
      return recipe.ustensils.some(
        (u) => u.toLowerCase() === tag.toLowerCase()
      );
    default:
      return false;
  }
}

function escapeInput(str) {
  return str.replace(/[&<>"]+/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

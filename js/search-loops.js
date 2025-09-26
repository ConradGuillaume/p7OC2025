// Recherche avec boucles natives
function searchRecipesLoops(query, recipes, selectedTags) {
  // Échapper la requête utilisateur
  query = escapeInput(query);
  let results = [];
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    if (matchesQuery(recipe, query) && matchesTags(recipe, selectedTags)) {
      results.push(recipe);
    }
  }
  return results;
}

function matchesQuery(recipe, query) {
  if (query.length < 3) return true;
  const q = query.toLowerCase();
  // Recherche dans titre, description, ingrédients
  if (recipe.name.toLowerCase().includes(q)) return true;
  if (recipe.description.toLowerCase().includes(q)) return true;
  for (let j = 0; j < recipe.ingredients.length; j++) {
    if (recipe.ingredients[j].ingredient.toLowerCase().includes(q)) return true;
  }
  return false;
}

function matchesTags(recipe, selectedTags) {
  // Intersection des tags
  for (let tagType in selectedTags) {
    for (let tag of selectedTags[tagType]) {
      if (!recipeHasTag(recipe, tagType, tag)) return false;
    }
  }
  return true;
}

function recipeHasTag(recipe, tagType, tag) {
  switch (tagType) {
    case "ingredients":
      for (let ing of recipe.ingredients) {
        if (ing.ingredient.toLowerCase() === tag.toLowerCase()) return true;
      }
      return false;
    case "appliances":
      return (
        recipe.appliance && recipe.appliance.toLowerCase() === tag.toLowerCase()
      );
    case "utensils":
      for (let u of recipe.ustensils) {
        if (u.toLowerCase() === tag.toLowerCase()) return true;
      }
      return false;
    default:
      return false;
  }
}

function escapeInput(str) {
  return str.replace(/[&<>"]+/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

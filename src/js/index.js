import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Likes from "./models/Likes";
/**Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list objects
 * - Liked recipes
 */
const state = {};
window.state = state;

const controlSearch = async () => {
  //1. Get query from view
  const query = searchView.getInput();
  //const query = "pizza";
  if (query) {
    //2. Create new search object and add to state
    state.search = new Search(query);
    //3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    //4. Search for recipes
    try {
      //5. Render results on UI
      await state.search.getResults();
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Something went wrong with the search..");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (event) => {
  const btn = event.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");
  if (id) {
    //1. Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    //2.Highlight selected recipe
    if (state.search) {
      searchView.highlightSelected(id);
    }

    //2. Create new recipe object
    state.recipe = new Recipe(id);

    //3. Get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      //4. Calc time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();
      //5. Render the recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      alert("Error proccessing recipe!");
    }
  }
};

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/**
 * LIST CONTROLLER
 */
const controlList = () => {
  // Create a new list IF there is none yet.
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach((ingredient) => {
    const item = state.list.addItem(
      ingredient.count,
      ingredient.unit,
      ingredient.ingredient
    );
    listView.renderItem(item);
  });
};

//Handling delete and update list item events

elements.shoppingList.addEventListener("click", (event) => {
  const id = event.target.closest(".shopping__item").dataset.itemid;

  //Handle delete button

  if (event.target.matches(".shopping__delete, .shopping__delete *")) {
    //Delete from state
    state.list.deleteItem(id);
    //Delete from user interface
    listView.deleteItem(id);
  } else if (event.target.matches(".shopping__count-value")) {
    const val = parseFloat(event.target.value);
    state.list.updateCount(id, val);
    if (val === 0) {
      state.list.deleteItem(id);
      //Delete from user interface
      listView.deleteItem(id);
    }
  }
});

/**
 * LIKE CONTROLLER
 */

const controlLikes = () => {
  if (!state.likes) {
    state.likes = new Likes();
  }
  //User has NOT yet liked a recipe
  //console.log(state.likes.isLiked(state.recipe.id));
  if (!state.likes.isLiked(state.recipe.id)) {
    /**
     * 1. Add like to state
     * 2. Toggle like button
     * 3. Add like to UI likes list
     */
    const newLikedRecipe = state.likes.addLike(
      state.recipe.id,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    likesView.toggleLikeButton(true);
    likesView.renderLike(newLikedRecipe);
    //User has liked the current recipe
  } else {
    /**
     * 1. Remove like from state
     * 2. Toggle like button
     * 3. Remove like from UI likes list
     */
    state.likes.deleteLike(state.recipe.id);
    likesView.toggleLikeButton(false);
    likesView.deleteLike(state.recipe.id);
  }
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};
// Restore liked recipes when page loads
window.addEventListener("load", () => {
  state.likes = new Likes();
  state.likes.readStorage();

  //Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());

  //Render the existing likes
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

//Handling recipe button clicks
elements.recipe.addEventListener("click", (event) => {
  //if target matches btn-decrease or any child elements of btn-decrease
  if (event.target.matches(".btn-decrease, .btn-decrease *")) {
    //Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.renderUpdatedIngredientsServings(state.recipe);
    }
  } else if (event.target.matches(".btn-increase, .btn-increase *")) {
    //increase button is clicked    state.recipe.updateServings('inc');
    state.recipe.updateServings("inc");
    recipeView.renderUpdatedIngredientsServings(state.recipe);
  } else if (event.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (event.target.matches(".recipe__love, .recipe__love *")) {
    controlLikes();
  }
});

//attaching list to window
window.list = new List();

import { elements } from "./base";

//implicit return on one argument arrow function
export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  //using curly bracers in arrow function to avoid implicitly returning a value (no value needs to be returned here)
  elements.searchInput.value = "";
};

export const clearResults = () => {
  //using curly bracers in arrow function to avoid implicitly returning a value (no value needs to be returned here)
  elements.searchResList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const limitRecipeTitle = (title, limit = 17) => {
  console.log("in limit recipe title");
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, curr) => {
      if (acc + curr.length <= limit) {
        newTitle.push(curr);
      }
      return acc + curr.length;
    }, 0);

    return `${newTitle.join(" ")} ...`;
  }
  return title;
};

export const highlightSelected = (id) => {
  const resultsArr = Array.from(document.querySelectorAll(".results__link"));
  resultsArr.forEach((el) => {
    el.classList.remove("results__link--active");
  });
  document
    .querySelector(`.results__link[href="#${id}"]`)
    .classList.add("results__link--active");
};

const renderRecipe = (recipe) => {
  const markup = `
                    <li>
                    <a class="results__link" href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src="${recipe.image_url}" alt="Test">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${limitRecipeTitle(
                              recipe.title
                            )}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>`;
  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

//prettier-ignore
const createButton = (page, type) =>
    `
                    <button class="btn-inline results__btn--${type}" data-goto=${type ==='prev' ? page - 1 : page + 1}>
                            <svg class="search__icon">
                                <use href="img/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
                            </svg>
                        <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
                    </button>
                `;

const renderButtons = (page, numOfResults, resPerPage) => {
  //if we have 41 recipes we need 5 pages
  const numPages = Math.ceil(numOfResults / resPerPage);
  let button;

  if (page === 1 && numPages > 1) {
    //Button to go to next page
    button = createButton(page, "next");
  } else if (page === numPages && numPages > 1) {
    //Only button to go to prev page
    button = createButton(page, "prev");
  } else {
    //Both buttons
    button = `${createButton(page, "prev")};
              ${createButton(page, "next")}
              `;
  }
  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResults = (recipes, page = 2, resPerPage = 10) => {
  console.log(recipes);
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;

  recipes.slice(start, end).forEach(renderRecipe);

  renderButtons(page, recipes.length, resPerPage);
};

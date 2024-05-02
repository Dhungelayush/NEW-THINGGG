var restaurantProp = "";
var curArea  = "";
var currentPage = 1; 
var isLoading = false; 
let allRestaurants = [];
function addRestaurantItem(restaurant) {
  const container = document.querySelector(".restaurant-container");

  // Create a new div for the restaurant item
  const restaurantItem = document.createElement("div");
  restaurantItem.classList.add("restaurant-item");

  // Create and append the logo element
  const logoImg = document.createElement("img");
  logoImg.src = restaurant.imageUrl; 
  logoImg.classList.add("restaurant-logo");
  restaurantItem.appendChild(logoImg);

  // Create and append the name element
  const nameElem = document.createElement("p");
  nameElem.textContent = restaurant.restaurantName;

  nameElem.classList.add("restaurant-name");
  restaurantItem.appendChild(nameElem);

  
  // Attach click event listener to the logo image
logoImg.addEventListener("click", () => {
  console.log("Before passing the restaurant == 0 " + restaurant);
  redirectToOrderPage(restaurant.orderReceiveEmail,restaurant.menuItems); 
});


  // Append the restaurant item to the container
  container.appendChild(restaurantItem);
}

async function redirectToOrderPage(email, restaurant) {
  await new Promise((resolve) => {
    console.log("The Restaurant == " , restaurant);
    localStorage.setItem("restaurantData", JSON.stringify(restaurant));
    console.log("Sucessfully set the data => " + localStorage.getItem("restaurantData"));
    resolve();
  });
  const encodedRestaurantName = encodeURIComponent(restaurantProp); // Encode the restaurant name
  const encodeRestaurantArea = encodeURIComponent(curArea);
  
  window.location.href = `orderPayment?receiver=${encodeURIComponent(email)}&restaurantName=${encodedRestaurantName}&area=${encodeRestaurantArea}`;
 
}

function loadMoreRestaurants() {
  if (!isLoading) {
    isLoading = true;

    const pageSize = 6;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const restaurantsToShow = allRestaurants.slice(startIndex, endIndex);

    restaurantsToShow.forEach((restaurant) => {
      addRestaurantItem(restaurant);
    });

    isLoading = false;
    currentPage++;
  }
}

window.addEventListener("scroll", () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = window.innerHeight;

  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMoreRestaurants();
  }
});

fetch("/static/area.json")
  .then((response) => response.json())
  .then((data) => {
    const areaDropdown = document.getElementById("area");
    const areas = data.areas;

    areas.forEach((area) => {
      const option = document.createElement("option");
      option.value = area;
      option.textContent = area;
      areaDropdown.appendChild(option);
    });
  })
  .catch((error) => {
    console.log("Error fetching areas:", error);
  });

document.getElementById("area").addEventListener("change", function () {
  const selectedArea = this.value;
  curArea = selectedArea;

  fetch(`/restaurantsByArea/${selectedArea}`)
    .then((response) => response.json())
    .then((data) => {
      allRestaurants = data;
      console.log("ALL REST + " , allRestaurants);
      currentPage = 1;

      const container = document.querySelector(".restaurant-container");
      container.innerHTML = "";

      loadMoreRestaurants();
    })
    .catch((error) => {
      console.log("Error fetching restaurant data:", error);
    });
});
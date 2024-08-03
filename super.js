// Set up the Marvel API keys and hash for secure access
const ts = new Date().getTime();
const publicKey = "904bc6981c49fe0cd10320376f221117";
const privateKey = "3caf4f3b9930dc26d0e570bc3c161c982f82aa76";
const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();
const baseURL = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

// Cache to store fetched superhero data and minimize API calls
let superheroCache = {};

// Event listener to set up event handlers and initialize page content
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const favoritesList = document.getElementById('favoritesList');
    const superheroName = document.getElementById('superheroName');

    // If the search bar is present, set up input event handler
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            fetchSuperheroes(query);
        });
    }

    // If the favorites list section is present, load favorites
    if (favoritesList) {
        loadFavorites();
    }

    // If on the superhero details page, fetch and display details
    if (superheroName) {
        const params = new URLSearchParams(window.location.search);
        const heroId = params.get('id');
        fetchSuperheroDetails(heroId);
    }
});


function fetchSuperheroes(query = "") {
    // Check if data for this query is already cached
    if (superheroCache[query]) {
        displaySuperheroes(superheroCache[query]);
    } else {
        fetch(`${baseURL}&nameStartsWith=${query}`)
            .then(response => response.json())
            .then(data => {
                superheroCache[query] = data.data.results;
                displaySuperheroes(data.data.results);
            })
            .catch(error => console.error("Error fetching data:", error));
    }
}


//Display a list of superheroes on the homepage.

function displaySuperheroes(superheroes) {
    const container = document.getElementById("superheroesList");
    if (container) {
        container.innerHTML = superheroes.map(hero => `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" class="card-img-top" alt="${hero.name}">
                    <div class="card-body">
                        <h5 class="card-title">${hero.name}</h5>
                        <a href="superhero.html?id=${hero.id}" class="btn btn-primary">More Detail</a>
                        <button class="btn btn-secondary" onclick="addToFavorites(${hero.id})">Add to Favorite</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}


 // Add a superhero to the favorites list and store in local storage.


function addToFavorites(heroId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(heroId)) {
        favorites.push(heroId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Added to favorites!");
        loadFavorites(); // Update the favorites section immediately
    } else {
        alert("Already in favorites!");
    }
}


 //Remove a superhero from the favorites list and update local storage.

function removeFromFavorites(heroId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(id => id !== heroId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Removed from favorites!");
    loadFavorites(); // Refresh the favorites list
}


 // Load the list of favorite superheroes from local storage and display them.

function loadFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.length === 0) {
        if (favoritesList) {
            favoritesList.innerHTML = "<p>No favorites added yet.</p>";
        }
    } else {
        fetchSuperheroesByIds(favorites);
    }
}


 //Fetch superhero data for a list of IDs from the Marvel API.

function fetchSuperheroesByIds(ids) {
    const promises = ids.map(id => fetch(`${baseURL}&id=${id}`).then(response => response.json()));
    Promise.all(promises)
        .then(responses => {
            const heroes = responses.map(response => response.data.results[0]);
            displayFavoriteSuperheroes(heroes);
        })
        .catch(error => console.error("Error fetching data:", error));
}


 //Display a list of favorite superheroes on the favorites page.

function displayFavoriteSuperheroes(superheroes) {
    if (favoritesList) {
        favoritesList.innerHTML = superheroes.map(hero => `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" class="card-img-top" alt="${hero.name}">
                    <div class="card-body">
                        <h5 class="card-title">${hero.name}</h5>
                        <p>${hero.description || 'No description available.'}</p>
                        <button class="btn btn-danger" onclick="removeFromFavorites(${hero.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}


 //Fetch and display details for a specific superhero by ID.

function fetchSuperheroDetails(heroId) {
    if (!heroId) return;
    fetch(`${baseURL}&id=${heroId}`)
        .then(response => response.json())
        .then(data => {
            const hero = data.data.results[0];
            document.getElementById("superheroName").innerText = hero.name;
            document.getElementById("superheroImage").src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
            document.getElementById("superheroDescription").innerText = hero.description || 'No description available.';
        })
        .catch(error => console.error("Error fetching data:", error));
}

/**
 * Author: Donavan Borges
 * CS 132 Spring 2024
 * Date: June 4, 2024
 * 
 * Client-side Javascript for the movie recommendation app. It uses TMDB API and an API
 * created to store movie reviews.
 * 
 *   \(G_G)/
 *      |
 *      |
 *     /\
 * I was approved for an extension by Professor Hovik.
 */

(function(){
    "use strict";
  
    const API_KEY = "2384666c6ea689d6f98125135d3af611";
    const TMDB_BASE_URL = "https://api.themoviedb.org/3";
    const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    const SERVER_BASE_URL = "http://localhost:3000";
  
    /**
     * Initialize event listeners and set up the application.
     */
    function init() {
        if (document.querySelector("#search-movie-btn")) {
            document.querySelector("#search-movie-btn").addEventListener("click", fetchMovieId);
            document.querySelector("#random-movie-btn").addEventListener("click", displayRandomMovie);
        }
        if (document.querySelector("#review-form")) {
            document.querySelector("#review-form").addEventListener("submit", submitReview);
            fetchReviews();
        }
    }
  
    /**
     * Fetches the movie ID from TMDB based on the movie inputted by the user.
     */
    async function fetchMovieId() {
        const query = document.querySelector("#search-input").value;
        if (!query) {
            displayMessage("Please enter a movie name.");
            return;
        }
    
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
        displayMessage("Searching for movies...");
    
        let resp = await fetch(url);
        if (resp.ok) {
            const jsonResp = await checkStatus(resp).json();
            if (jsonResp.results.length === 0) {
                displayMessage("No movies found.");
                return;
            }
            displaySearchedMovie(jsonResp.results[0]);
            fetchMovieRecommendations(jsonResp.results[0].id);
        } else {
            handleError("Unable to fetch movies. Please try again later.");
        }
    }

    /**
     * Displays the user's searched movie as a simple message and poster.
     * @param {Object} movie - the movie object retrieved from the TMDB search.
     */
    function displaySearchedMovie(movie) {
        const selectedMovie = document.querySelector("#selected-movie");
        while (selectedMovie.firstChild) {
            selectedMovie.removeChild(selectedMovie.firstChild);
        }

        const message = document.createElement("h2");
        message.textContent = "Movies similar to " + movie.title;
        selectedMovie.appendChild(message);

        if (movie.poster_path) {
            const image = document.createElement("img");
            image.src = IMAGE_BASE_URL + movie.poster_path;
            image.alt = `Poster of ${movie.title}`;
            selectedMovie.appendChild(image);
        } else {
            const noImageMessage = document.createElement("p");
            noImageMessage.textContent = "No poster available";
            selectedMovie.appendChild(noImageMessage);
        }
    }
  
    /**
     * Fetches movie recommendations based on the movie ID.
     * @param {number} movieId - The ID of the movie to fetch recommendations for.
     */
    async function fetchMovieRecommendations(movieId) {
        const url = `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`;
        displayMessage("Fetching recommendations...");
    
        let resp = await fetch(url);
        if (resp.ok) {
            const jsonResp = await checkStatus(resp).json();
            processMovieData(jsonResp);
        } else {
            handleError("Unable to fetch recommendations. Please try again later.");
        }
    }
  
    /**
     * Processes and displays the fetched movie recommendations as cards.
     * @param {Object} data - object returned from the TMDB API.
     */
    function processMovieData(data) {
        const recommendations = document.querySelector("#recommendations");
        while (recommendations.firstChild) {
            recommendations.removeChild(recommendations.firstChild)
        }
        
        // 9 movie recommendations!
        data.results.slice(0, 9).forEach(movie => {
            const card = createMovieCard(movie);
            recommendations.appendChild(card);
        });
        
        displayMessage("");
    }
  
    /**
     * Creates a movie card element containing movie details including the movie's description.
     * @param {Object} movie - movie data object from TMDB.
     * @returns - the movie card.
     */
    function createMovieCard(movie) {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.onclick = () => saveMovie(movie);
    
        const image = document.createElement("img");
        image.src = movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : "no-image-available.jpg";
        image.alt = `Poster of ${movie.title}`;
        card.appendChild(image);
    
        const title = document.createElement("h3");
        title.textContent = movie.title;
        card.appendChild(title);
    
        const description = document.createElement("p");
        description.textContent = movie.overview;
        description.className = "movie-description";
        card.appendChild(description);
    
        const details = document.createElement("p");
        details.textContent = `Rating: ${movie.vote_average} | Released: ${movie.release_date}`;
        card.appendChild(details);
    
        return card;
    }
  
    /**
     * Saves the selected movie to the "Saved Movies" list.
     * @param {Object} movie - the selected movie.
     */
    function saveMovie(movie) {
        const moviesList = document.querySelector("#movies-list");
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.addEventListener("click", function() {
            this.remove();
        });
        moviesList.appendChild(li);
    }

    /**
     * Displays the the randomly selected movie and its movie card
     */
    async function displayRandomMovie() {
        const moviesList = document.querySelectorAll("#movies-list li");
        if (moviesList.length === 0) {
            displayMessage("No saved movies to display.");
            const selectedMovie = document.querySelector("#selected-movie");
            while (selectedMovie.firstChild) {
                selectedMovie.removeChild(selectedMovie.firstChild);
            }
            const recommendations = document.querySelector("#recommendations");
            while (recommendations.firstChild) {
                recommendations.removeChild(recommendations.firstChild);
            }
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * moviesList.length);
        const selectedMovieTitle = moviesList[randomIndex].textContent;
        
        const selectedMovie = document.querySelector("#selected-movie");
        while (selectedMovie.firstChild) {
            selectedMovie.removeChild(selectedMovie.firstChild);
        }
        const recommendations = document.querySelector("#recommendations");
        while (recommendations.firstChild) {
            recommendations.removeChild(recommendations.firstChild);
        }

        const url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(selectedMovieTitle)}`;
        let resp = await fetch(url);
        if (resp.ok) {
            const jsonResp = await checkStatus(resp).json();
            if (jsonResp.results.length > 0) {
                const movie = jsonResp.results[0];
                const movieCard = createMovieCard(movie);
                document.querySelector("#selected-movie").appendChild(movieCard);
            } else {
                displayMessage("Failed to retrieve the selected movie details.");
            }
        } else {
            handleError("Unable to fetch movie details. Please try again later.");
        }
    }

    // Below are new functions for CP4
    /**
     * Fetches and displays reviews from the server.
     */
    async function fetchReviews() {
        const url = `${SERVER_BASE_URL}/reviews`;
        let resp = await fetch(url);
        if (resp.ok) {
            const jsonResp = await checkStatus(resp).json();
            displayReviews(jsonResp);
        } else {
            handleError("Unable to fetch reviews. Please try again later.");
        }
    }

    /**
     * Submits a new review to the server and updates the review display.
     * @param {Event} event - The submit event from the review form.
     */
    async function submitReview(event) {
        event.preventDefault();
    
        const movie = document.querySelector("#movie").value;
        const review = document.querySelector("#review").value;
        const rating = document.querySelector("#rating").value;
    
        const url = `${SERVER_BASE_URL}/reviews`;
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movie, review, rating })
        };

        let resp = await fetch(url, fetchOptions);
        if (resp.ok) {
            fetchReviews();
            displayMessage("Review submitted successfully!");
            document.querySelector("#movie").value = '';
            document.querySelector("#review").value = '';
            document.querySelector("#rating").value = '';
        } else {
            handleError("Failed to submit review. Please try again or check your network.");
        }
    }

    /**
     * Displays reviews on the page.
     * @param {Array} reviews - An array of review objects.
     */
    function displayReviews(reviews) {
        const reviewsContainer = document.querySelector("#reviews-container");
        while (reviewsContainer.firstChild) {
            reviewsContainer.removeChild(reviewsContainer.firstChild);
        }

        reviews.forEach(review => {
            const reviewElement = document.createElement("div");
            reviewElement.className = "review-card";
            
            const title = document.createElement("h3");
            title.textContent = review.movie;
            reviewElement.appendChild(title);

            const reviewText = document.createElement("p");
            reviewText.textContent = review.review;
            reviewElement.appendChild(reviewText);

            const ratingText = document.createElement("p");
            ratingText.textContent = `Rating: ${review.rating}/5`;
            reviewElement.appendChild(ratingText);

            reviewsContainer.appendChild(reviewElement);
        });
    }

    // Helper functions are below
    /**
     * Displays a message to the user.
     * @param {string} msg - the message to display.
     * Decided to create this function to hopefully simplify code and better UI :)
     */
    function displayMessage(msg) {
        const messageBox = document.querySelector("#response-message");
        if (messageBox) {
            messageBox.textContent = msg;
        }
    }
  
    /**
     * Helper function to return the Response data if successful, otherwise
     * returns an Error that needs to be caught.
     * @param {Response} response - response with status to check for success/error.
     * @returns {Response} - The Response object if successful, otherwise an Error that
     * needs to be caught.
     * 
     * This function is taken from HW3.
     */
    function checkStatus(response) {
        if (!response.ok) {
            throw new Error(`Error in request: ${response.statusText}`);
        }
        return response;
    }
  
    /**
     * Handles errors that occur during the fetch process.
     * @param {Error} err - the error details of the request.
     * 
     * I changed the name of this function to match the Client-Side JavaScript requirements.
     * This change can be seen with CP3 to CP4.
     */
    function handleError(err) {
        displayMessage(err.message);
    }
    
    init();
})();
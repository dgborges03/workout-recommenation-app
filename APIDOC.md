# Movie Recommendation App API Documentation
This API allows users to interact with the movie recommendation application by 
providing functionality for submitting reviews, interact with movie reviews,
and retrieve a list of movies with reviews.

## GET /reviews
**Request Type:** GET

**Returned Data Format**: 
JSON or Plain Text

**Description:** 
Returns all reviews created by users.

**Supported Parameters** 
format = json/text to specify whether which format is returned

**Example Request:**
/reviews?format=json

**Example Response:**
```json
[
  {
    "movie": "Transformers",
    "review": "This movie was pretty good!",
    "rating": "3.5"
  },
  {
    "movie": "Godzilla: Minus One",
    "review": "This movie was the best thing I ever seen!",
    "rating": "5"
  }
]
```

**Example Request:**
/reviews?format=text

**Example Response:**
```
Transformers - This movie was pretty good! (Rating: 3.5/5)
Godzilla: Minus One - This movie was the best thing I ever seen! (Rating: 5/5)
```

**Error Handling:**
400: If the format parameter value is invalid.
500: If there's a server-side problem processing the request.

## GET /movies 
**Request Format:** GET

**Returned Data Format**: 
JSON

**Description:**
Returns a list of movie titles that have been reviewed.

**Supported Parameters**
None

**Example Request:**
/movies

**Example Response:**
```json
[
  "Transformers",
  "Godzilla: Minus One"
]
```

**Error Handling:**
500: If there was a server-side problem that prevented the retrieval of movie titles.

## POST /reviews
**Request Format:** POST

**Returned Data Format**: 
JSON

**Description:**
Allows users to submit reviews for movies. Each review includes a statement, a numerical rating,
and the title of the movie.

**Supported Parameters**
* POST body parameters:
    * `moive` (required) - name of the movie being reviewed
    * `review` (required) - the user's textual review
    * `rating` (required) - the user's numerical rating on a scale of 0 to 5


**Example Request:** `/reviews`
* POST body parameters: 
  * `movie = 'Spirited Away`
  * `review = 'An incredible movie with incredible animation!'`
  * `rating = '5'`

**Example Response:**
```json
{
  "success": true,
  "message": "Review added successfully."
}
```

**Error Handling:**
400: If any required fields are missing or improperly formatted.
500: If there's a server-side problem processing the request.

**Example Response:**
```json
{
  "success": false,
  "error": "Missing required field: ..."
}
```
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from model import ImprovedContentRecommender
import os
from flask import jsonify, make_response

app = Flask(__name__)
CORS(app)

base_dir = os.path.join(os.path.dirname(__file__), "../data/ml-latest-small")

ratings_path = os.path.join(base_dir, "ratings.csv")
movies_path = os.path.join(base_dir, "movies.csv")
tags_path = os.path.join(base_dir, "tags.csv")

#load data into dataframes
ratings = pd.read_csv(ratings_path)
movies = pd.read_csv(movies_path)
tags = pd.read_csv(tags_path)

#create and fit the model
recommender = ImprovedContentRecommender(movies, ratings, tags)
recommender.fit()

#movie recommendations route
@app.route('/recommend', methods=['GET'])
def recommend():
    movie_title = request.args.get('movie_title', '')
    n_recommendations = int(request.args.get('n', 6))
    recommendations = recommender.get_recommendations(movie_title, n_recommendations)

    if recommendations.empty:
        return jsonify({"error": "Movie not found"}), 404
    
    result = recommendations.to_dict(orient='records')
    return jsonify(result)

#search suggestions route
@app.route('/search-suggestions', methods=['GET'])
def search_suggestions():
    query = request.args.get('query', '').lower()
    suggestions = movies[movies['title'].str.lower().str.contains(query, na=False)]
    suggestions_list = suggestions['title'].head(10).tolist()  # Limit to 10 suggestions

    response = make_response(jsonify(suggestions_list))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

#get movie details route
@app.route('/movie-details', methods=['GET'])
def movie_details():
    movie_title = request.args.get('movie_title', '')

    try:

        movie = movies[movies['title'] == movie_title].iloc[0].to_dict()
        rating = ratings[ratings['movieId'] == movie['movieId']]['rating'].mean()
        movie['rating'] = round(rating, 1) if not pd.isnull(rating) else 'Not Available'

        recommendations = recommender.get_recommendations(movie_title, 10)
        recommendations = recommendations[recommendations['title'] != movie_title]
        recommendations_list = recommendations['title'].head(5).tolist()

        response = {
            "movie": movie,
            "recommendations": recommendations_list
        }
        return jsonify(response)
    
    except (IndexError, KeyError):
        return jsonify({"error": "Movie not found"}), 404

#genre based movie recommendations route
@app.route('/movies-by-genre', methods=['GET'])
def movies_by_genre():
    genre = request.args.get('genre', '').lower()
    try:
        # Filter movies containing the specified genre
        filtered_movies = movies[movies['genres'].str.lower().str.contains(genre, na=False)]
        filtered_movies = filtered_movies.merge(
            ratings.groupby('movieId')['rating'].mean().reset_index(),
            on='movieId',
            how='left'
        )
        top_movies = filtered_movies.sort_values(by='rating', ascending=False).head(30)
        result = top_movies[['title', 'genres', 'rating']].to_dict(orient='records')
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching movies by genre."}), 500

if __name__ == '__main__':
    app.run(debug=True)

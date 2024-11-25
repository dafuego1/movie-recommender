from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from model import ImprovedContentRecommender
import os
from flask import jsonify, make_response
import requests
from bs4 import BeautifulSoup
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
app = Flask(__name__)
limiter = Limiter(get_remote_address, app=app)
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


# Helper function to get IMDb URL and description
def get_imdb_description(movie_id):
    imdb_mapping_path = os.path.join(base_dir, "links.csv")
    imdb_mapping = pd.read_csv(imdb_mapping_path)
    try:
        imdb_id = imdb_mapping[imdb_mapping['movieId'] == movie_id].iloc[0]['imdbId']
        imdb_url = f"https://www.imdb.com/title/tt{int(imdb_id):07d}/"

        headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        response = requests.get(imdb_url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            description_tag = soup.find('span', {'data-testid': 'plot-l'})
            if description_tag:
                description = description_tag.text.strip()
                return imdb_url, description
            else:
                return imdb_url, "Description not available"
        else:
            return imdb_url, "Failed to fetch description"
    except Exception as e:
        print(f"Error fetching IMDb details: {e}")
        return None, "Description not available"

#get movie details route
@app.route('/movie-details', methods=['GET'])
def movie_details():
    movie_title = request.args.get('movie_title', '')

    try:
        movie = movies[movies['title'] == movie_title].iloc[0].to_dict()
        rating = ratings[ratings['movieId'] == movie['movieId']]['rating'].mean()
        movie['rating'] = round(rating, 2) if not pd.isnull(rating) else 'Not Available'
        
        #get IMDb details
        imdb_url, description = get_imdb_description(movie['movieId'])
        movie['imdb_url'] = imdb_url
        movie['description'] = description

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

#get top-rated movies for home page route
@app.route('/top-rated', methods=['GET'])
def top_rated_movies():
    try:
        rating_stats = ratings.groupby('movieId').agg(
            avg_rating=('rating', 'mean'),
            rating_count=('rating', 'count')
        ).reset_index()

        filtered_movies = rating_stats[rating_stats['rating_count'] > 30]

        filtered_movies = filtered_movies.merge(movies, on='movieId', how='left')

        filtered_movies['avg_rating'] = filtered_movies['avg_rating'].round(2)

        top_movies = filtered_movies.sort_values(by='avg_rating', ascending=False).head(8)

        result = top_movies[['title', 'genres', 'avg_rating']].to_dict(orient='records')

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



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
@limiter.limit("100 per minute")
def search_suggestions():
    query = request.args.get('query', '').lower()
    suggestions = movies[movies['title'].str.lower().str.contains(query, na=False)]
    suggestions_list = suggestions['title'].head(10).tolist()

    response = make_response(jsonify(suggestions_list))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

@app.route('/movies-by-genre', methods=['GET'])
def movies_by_genre():
    genre = request.args.get('genre', '').lower()
    try:
        filtered_movies = movies[movies['genres'].str.lower().str.contains(genre, na=False)]

        rating_stats = ratings.groupby('movieId').agg(
            avg_rating=('rating', 'mean'),
            rating_count=('rating', 'count')
        ).reset_index()

        filtered_movies = filtered_movies.merge(rating_stats, on='movieId', how='left')

        filtered_movies = filtered_movies[filtered_movies['rating_count'] > 30]

        filtered_movies['avg_rating'] = filtered_movies['avg_rating'].round(2)

        top_movies = filtered_movies.sort_values(by='avg_rating', ascending=False).head(30)

        result = top_movies[['title', 'genres', 'avg_rating']].to_dict(orient='records')

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)

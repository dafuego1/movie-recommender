import React from 'react';

const MovieList = ({ movies }) => {
    return (
        <section className="movie-list">
            <h2>Featured Movies</h2>
            <div className="movie-items">
                {movies.length === 0 ? (
                    <p>No recommendations found. Try searching for another movie.</p>
                ) : (
                    movies.map((movie, index) => (
                        <div key={index} className="movie-item">
                            <h3>{movie.title}</h3>
                            <p><strong>Rating:</strong> {movie.bayesian_rating.toFixed(1)}</p>
                            <p><strong>Genres:</strong> {movie.genres}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default MovieList;

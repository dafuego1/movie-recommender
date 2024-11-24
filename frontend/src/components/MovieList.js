import React from 'react';
import { Link } from 'react-router-dom';

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
                            <p>
                                <strong>Rating:</strong>{" "}
                                {movie.rating
                                    ? movie.rating.toFixed(1)
                                    : "Not Available"}
                            </p>
                            <p><strong>Genres:</strong> {movie.genres || "Not Available"}</p>
                            {/* View Details Button */}
                            <Link
                                to={`/movie/${encodeURIComponent(movie.title)}`}
                                className="view-details"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default MovieList;

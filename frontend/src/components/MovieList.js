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
                            <p className='rating'>
                                <strong>Rating:{" "}
                                {movie.avg_rating
                                    ? movie.avg_rating.toFixed(1)
                                    : "Not Available"}
                                    </strong>
                            </p>
                            <p> {movie.genres || "Not Available"}</p>
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

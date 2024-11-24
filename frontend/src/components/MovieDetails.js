import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MovieDetails = () => {
    const { movieTitle } = useParams();
    const [movieDetails, setMovieDetails] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/movie-details?movie_title=${encodeURIComponent(movieTitle)}`
                );
                setMovieDetails(response.data.movie);
                setRecommendations(response.data.recommendations || []);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieTitle]);

    if (loading) {
        return <div>Loading movie details...</div>;
    }

    return (
        <div className="movie-details">
            <h2>{movieDetails.title}</h2>
            <p className="genres">{movieDetails.genres || 'Genres not available'}</p>
            <p className="rating">Rating: {movieDetails.rating || 'Not Available'}</p>
            <p className="description">
                Description: {movieDetails.description || 'Description not available'}
            </p>
            <a href={movieDetails.imdb_url} target="_blank" rel="noopener noreferrer" className="imdb-link">
                View on IMDb
            </a>

            <div className="recommendations-section">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-card">
                                <p>{rec}</p>
                                <button
                                    onClick={() =>
                                        window.location.href = `/movie/${encodeURIComponent(rec)}`
                                    }
                                    className="view-details"
                                >
                                    View Details
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
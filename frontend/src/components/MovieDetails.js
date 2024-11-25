import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    const fetchRecommendationDetails = async (title) => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:5000/movie-details?movie_title=${encodeURIComponent(title)}`
            );
            return response.data.movie;
        } catch (error) {
            console.error(`Error fetching details for ${title}:`, error);
            return null;
        }
    };

    if (loading) {
        return <div>Loading movie details...</div>;
    }

    return (
        <div className="movie-details">
            <h2>{movieDetails.title}</h2>
            <p className="genres">{movieDetails.genres || 'Genres not available'}</p>
            <p className="rating">
            <strong>Rating: {movieDetails.rating || 'Not Available'}</strong>
            </p>
            <p className="description">{movieDetails.description}</p>
            {movieDetails.imdb_url && (
                <a href={movieDetails.imdb_url} target="_blank" rel="noopener noreferrer" className="imdb-link">
                    View on IMDb
                </a>
            )}

            <div className="recommendations-section">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                            <RecommendationCard
                                key={index}
                                title={rec}
                                fetchRecommendationDetails={fetchRecommendationDetails}
                            />
                        ))
                    ) : (
                        <p>No recommendations available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecommendationCard = ({ title, fetchRecommendationDetails }) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const movieDetails = await fetchRecommendationDetails(title);
            setDetails(movieDetails);
        };

        fetchDetails();
    }, [title, fetchRecommendationDetails]);

    if (!details) {
        return (
            <div className="recommendation-card">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="recommendation-card">
            <h4>{details.title}</h4>
            <p className="genres">{details.genres || 'Genres not available'}</p>
            <p className="rating">
            <strong>Rating: {details.rating || 'Not Available'}</strong>
            </p>
            <button
                onClick={() => window.location.href = `/movie/${encodeURIComponent(details.title)}`}
                className="view-details"
            >
                View Details
            </button>
        </div>
    );
};

export default MovieDetails;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GenreMovies = () => {
    const { genre } = useParams();
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMoviesByGenre = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/movies-by-genre?genre=${encodeURIComponent(genre)}`);
                setMovies(response.data);
            } catch (error) {
                console.error('Error fetching movies by genre:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMoviesByGenre();
    }, [genre]);

    const handleMovieClick = (movieTitle) => {
        navigate(`/movie/${encodeURIComponent(movieTitle)}`);
    };

    if (loading) {
        return <div>Loading movies...</div>;
    }

    return (
        <div className="genre-movies">
            <h2>Top Rated Movies for {genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
            <div className="movie-list">
                {movies.length > 0 ? (
                    movies.map((movie, index) => (
                        <div
                            key={index}
                            className="movie-item"
                            onClick={() => handleMovieClick(movie.title)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>{movie.title}</h3>
                            <p className="rating"><strong>Rating: {movie.avg_rating ? movie.avg_rating.toFixed(1) : 'Not Available'}</strong></p>
                            <p>{movie.genres}</p>
                        </div>
                    ))
                ) : (
                    <p>No movies found for this genre.</p>
                )}
            </div>
        </div>
    );
};

export default GenreMovies;

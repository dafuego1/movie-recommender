import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GenreMovies = () => {
    const { genre } = useParams();
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

    if (loading) {
        return <div>Loading movies...</div>;
    }

    return (
        <div className="genre-movies">
            <h2>Top Rated Movies for {genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
            <div className="movie-list">
                {movies.length > 0 ? (
                    movies.map((movie, index) => (
                        <div key={index} className="movie-item">
                            <h3>{movie.title}</h3>
                            <p>{movie.genres}</p>
                            <p>Rating: {movie.rating ? movie.rating.toFixed(1) : 'Not Available'}</p>
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

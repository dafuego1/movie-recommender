import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Header from './components/Header';
import MovieList from './components/MovieList';
import GenreList from './components/GenreList';
import MovieDetails from './components/MovieDetails';
import GenreMovies from './components/GenreMovies';
import axios from 'axios';
import './styles.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch top-rated movies on mount
    useEffect(() => {
        const fetchTopRatedMovies = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/top-rated');
                setFeaturedMovies(response.data);
            } catch (error) {
                console.error('Error fetching top-rated movies:', error);
            }
        };
        fetchTopRatedMovies();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:5000/recommend?movie_title=${searchTerm}&n=5`
            );
            setMovies(response.data);
        } catch (error) {
            alert('Movie not found or an error occurred.');
        }
    };

    return (
        <div className="app-container">
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                fetchRecommendations={fetchRecommendations}
            />
            <Routes>
                {/* Home Route */}
                <Route
                    path="/"
                    element={
                        <>
                            <Header />
                            <MovieList movies={featuredMovies} />
                            <GenreList />
                        </>
                    }
                />
                {/* Movie Details Route */}
                <Route path="/movie/:movieTitle" element={<MovieDetails />} />
                {/* Genre Movies Route */}
                <Route path="/genre/:genre" element={<GenreMovies />} />
            </Routes>
        </div>
    );
}

export default App;
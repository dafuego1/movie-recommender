import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            alert('Please enter a movie title.');
            return;
        }

        try {
            const encodedTitle = encodeURIComponent(searchTerm.trim());
            const response = await axios.get(
                `http://127.0.0.1:5000/movie-details?movie_title=${encodedTitle}`
            );

            if (response.data.movie) {
                navigate(`/movie/${encodedTitle}`);
            } else {
                alert('Movie not found.');
            }
        } catch (error) {
            console.error('Error during search:', error);
            alert('An error occurred while searching for the movie.');
        }
    };

    const fetchSuggestions = async (query) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/search-suggestions?query=${query}`);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (query.length > 1) {
            fetchSuggestions(query);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
        navigate(`/movie/${encodeURIComponent(suggestion)}`);
    };

    return (
        <nav className="navbar">
            <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                Movie Recommender
            </h2>
            <div className="search-container" style={{ position: 'relative' }}>
                <input
                    type="text"
                    id="search-bar"
                    name="search"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Search for movies"
                />
                <button type="button" onClick={handleSearch}>
                    Search
                </button>
                {suggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="suggestion-item"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

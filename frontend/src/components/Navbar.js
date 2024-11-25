import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
const Navbar = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const navigate = useNavigate();

    const handleSearch = async () => {
        const sanitizedSearchTerm = DOMPurify.sanitize(searchTerm.trim());
    
        if (!sanitizedSearchTerm) {
            alert('Please enter a movie title.');
            return;
        }
    
        try {
            const encodedTitle = encodeURIComponent(sanitizedSearchTerm);
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
            setActiveSuggestion(-1);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        const sanitizedQuery = DOMPurify.sanitize(query);
        setSearchTerm(sanitizedQuery);
    
        if (sanitizedQuery.length > 1) {
            fetchSuggestions(sanitizedQuery);
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setActiveSuggestion((prev) =>
                Math.min(prev + 1, suggestions.length - 1)
            );
        } else if (e.key === 'ArrowUp') {
            setActiveSuggestion((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            if (activeSuggestion >= 0) {
                handleSuggestionClick(suggestions[activeSuggestion]);
            } else {
                handleSearch();
            }
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
                    onKeyDown={handleKeyDown}
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
                                className={`suggestion-item ${
                                    activeSuggestion === index ? 'active' : ''
                                }`}
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

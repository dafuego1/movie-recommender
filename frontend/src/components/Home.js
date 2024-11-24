import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleGenreClick = (genre) => {
        navigate(`/genre/${genre}`);
    };

    return (
        <div className="home-container">
            <div className="header">
                <h1>Discover the Latest Movies</h1>
                <p>Find your next favorite film</p>
            </div>

            <div className="featured-movies">
                <h3>Featured Movies</h3>
                <p className="no-recommendations">No recommendations found. Try searching for another movie.</p>
            </div>

            <div className="genre-list">
                <h2>Popular Genres</h2>
                <div className="genre-items">
                    <div className="genre-item" onClick={() => handleGenreClick('action')}>
                        <h3>Action</h3>
                        <p>Explore Action movies</p>
                    </div>
                    <div className="genre-item" onClick={() => handleGenreClick('comedy')}>
                        <h3>Comedy</h3>
                        <p>Explore Comedy movies</p>
                    </div>
                    <div className="genre-item" onClick={() => handleGenreClick('drama')}>
                        <h3>Drama</h3>
                        <p>Explore Drama movies</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

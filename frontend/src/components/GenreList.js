import React from 'react';
import { useNavigate } from 'react-router-dom';

const GenreList = () => {
    const navigate = useNavigate();

    const handleGenreClick = (genre) => {
        navigate(`/genre/${genre.toLowerCase()}`);
    };

    return (
        <div className="genre-list">
            <h2>Popular Genres</h2>
            <div className="genre-items">
                <div className="genre-item" onClick={() => handleGenreClick('Action')}>
                    <h3>Action</h3>
                    <p>Adrenaline Rush Starts Here</p>
                </div>
                <div className="genre-item" onClick={() => handleGenreClick('Comedy')}>
                    <h3>Comedy</h3>
                    <p>Tickle Your Funny Bone</p>
                </div>
                <div className="genre-item" onClick={() => handleGenreClick('Drama')}>
                    <h3>Drama</h3>
                    <p>Where Emotions Run High</p>
                </div>
            </div>
        </div>
    );
};

export default GenreList;

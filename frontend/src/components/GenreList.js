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
                    <p>Explore Action movies</p>
                </div>
                <div className="genre-item" onClick={() => handleGenreClick('Comedy')}>
                    <h3>Comedy</h3>
                    <p>Explore Comedy movies</p>
                </div>
                <div className="genre-item" onClick={() => handleGenreClick('Drama')}>
                    <h3>Drama</h3>
                    <p>Explore Drama movies</p>
                </div>
            </div>
        </div>
    );
};

export default GenreList;

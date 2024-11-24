import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
import re

base_dir = os.path.join(os.path.dirname(__file__), "../data/ml-latest-small")

ratings_path = os.path.join(base_dir, "ratings.csv")
movies_path = os.path.join(base_dir, "movies.csv")
tags_path = os.path.join(base_dir, "tags.csv")

ratings = pd.read_csv(ratings_path)
movies = pd.read_csv(movies_path)
tags = pd.read_csv(tags_path)

class ImprovedContentRecommender:
    def __init__(self, movies_df, ratings_df, tags_df):
        self.movies_df = movies_df.copy()
        self.ratings_df = ratings_df.copy()
        self.tags_df = tags_df.copy()
        self.tags_df['tag'] = self.tags_df['tag'].astype(str)
        self.tfidf_matrix = None
        self.nn_model = None
        
    def preprocess_text(self, text):
        if pd.isna(text):
            return ""
        
        #convert to lowercase and remove special characters
        text = str(text)
        text = re.sub(r'[^a-zA-Z\s]', '', text.lower())

        #lemmatize and remove stopwords
        lemmatizer = WordNetLemmatizer()
        words = text.split()
        words = [lemmatizer.lemmatize(word) for word in words]
        stop_words = set(stopwords.words('english'))
        words = [word for word in words if word not in stop_words]
        
        return ' '.join(words)
    
    #create feature matrix with weighted components
    def create_feature_matrix(self):
        #process genres
        self.movies_df['genres'] = self.movies_df['genres'].str.replace('|', ' ')
        
        #process tags with weights based on tag frequency
        tag_counts = self.tags_df['tag'].value_counts()
        tag_weights = 1 / np.log1p(tag_counts)
        
        #create a DataFrame for the weighted tags
        weighted_tags_df = pd.DataFrame({
            'tag': tag_counts.index,
            'weight': tag_weights.values
        })
        
        #merge weights with original tags
        weighted_tags = self.tags_df.merge(
            weighted_tags_df,
            on='tag',
            how='left'
        )
        
        #calculate weighted tags
        weighted_tags['weighted_tag'] = weighted_tags['tag'] + ' ' + \
            (weighted_tags['weight'] * 1).round(3).astype(str)
        
        #aggregate tags by movieId
        tags_aggregated = weighted_tags.groupby('movieId')['weighted_tag'].apply(
            lambda x: ' '.join(x)
        ).reset_index()
        
        #merge tags with movies
        self.movies_df = self.movies_df.merge(
            tags_aggregated,
            on='movieId',
            how='left'
        )
        self.movies_df['weighted_tag'].fillna('', inplace=True)
        
        #extract year from title
        self.movies_df['year'] = self.movies_df['title'].str.extract(
            r'\((\d{4})\)'
        ).fillna('2000')
        self.movies_df['year'] = pd.to_numeric(self.movies_df['year'])
    
        #calculate rating statistics
        rating_stats = self.ratings_df.groupby('movieId').agg({
            'rating': ['count', 'mean', 'std']
        }).reset_index()
        rating_stats.columns = ['movieId', 'rating_count', 'rating_mean', 'rating_std']
        
        #apply Bayesian average
        C = rating_stats['rating_count'].mean()
        m = rating_stats['rating_mean'].mean()
        rating_stats['bayesian_rating'] = (
            (C * m + rating_stats['rating_count'] * rating_stats['rating_mean']) /
            (C + rating_stats['rating_count'])
        )
        
        #merge rating statistics
        self.movies_df = self.movies_df.merge(
            rating_stats,
            on='movieId',
            how='left'
        )
        
        #fill NaN values in rating statistics
        rating_cols = ['rating_count', 'rating_mean', 'rating_std', 'bayesian_rating']
        self.movies_df[rating_cols] = self.movies_df[rating_cols].fillna(0)
        
        #create combined content feature
        self.movies_df['content'] = (
            self.movies_df['genres'].fillna('').apply(self.preprocess_text) + ' ' +
            self.movies_df['weighted_tag'].fillna('').apply(self.preprocess_text) + ' ' +
            self.movies_df['year'].astype(str) + ' ' +
            (self.movies_df['bayesian_rating'] * 2).round(1).astype(str)
        )
        
        #create TF-IDF matrix
        self.tfidf = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            min_df=2,
            max_df=0.95,
            stop_words='english'
        )
        self.tfidf_matrix = self.tfidf.fit_transform(self.movies_df['content'])
        
        return self.tfidf_matrix
    
    #build enhanced similarity model
    def build_similarity_model(self):

        #create base similarity matrix
        cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix).astype(np.float32)
        
        #calculate popularity penalty
        scaler = MinMaxScaler()
        popularity_penalty = scaler.fit_transform(
            self.movies_df[['rating_count']].values
        )
        popularity_weight = 0.2
        
        #calculate recency bonus
        current_year = 2018
        years = self.movies_df['year'].values
        recency_bonus = scaler.fit_transform(
            (current_year - years).reshape(-1, 1)
        )
        recency_weight = 0.1
        
        #combine factors
        self.similarity_matrix = (
            cosine_sim * (1 - popularity_weight - recency_weight) +
            (popularity_penalty * popularity_weight) +
            (recency_bonus * recency_weight)
        ).astype(np.float32)
        
        #initialize, fit, and save the NearestNeighbors model
        self.nn_model = NearestNeighbors(
            n_neighbors=20,
            metric='precomputed',
            algorithm='brute'
        )
        self.nn_model.fit(1 - self.similarity_matrix)
        
        return self.nn_model
    
    #get recommendations with diversity optimization
    def get_recommendations(self, movie_title, n_recommendations=10):
        try:
            movie_idx = self.movies_df[
                self.movies_df['title'] == movie_title
            ].index[0]
        except (IndexError, KeyError):
            print(f"Movie '{movie_title}' not found in the database.")
            return pd.DataFrame()
        
        #get initial recommendations
        distances, indices = self.nn_model.kneighbors(
            1 - self.similarity_matrix[movie_idx].reshape(1, -1)
        )
        
        #convert distances back to similarities
        similarities = 1 - distances.flatten()
        
        #apply diversity optimization
        final_indices = [indices.flatten()[0]]
        for _ in range(1, n_recommendations):
            avg_similarities = np.mean([
                self.similarity_matrix[idx] for idx in final_indices
            ], axis=0)
            candidates = indices.flatten()
            scores = similarities - 0.3 * avg_similarities[candidates]
            for candidate_idx in candidates[np.argsort(-scores)]:
                if candidate_idx not in final_indices:
                    final_indices.append(candidate_idx)
                    break

        #get and return recommendations
        recommendations = self.movies_df.iloc[final_indices][
            ['title', 'bayesian_rating', 'rating_count', 'genres']
        ].copy()
        
        recommendations['similarity_score'] = similarities[
            [list(indices.flatten()).index(idx) for idx in final_indices]
        ]
        
        return recommendations

    def fit(self):
        print("Creating feature matrix...")
        self.create_feature_matrix()
        print("Building similarity model...")
        self.build_similarity_model()
        return self
    

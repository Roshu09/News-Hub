import React, { useState, useEffect } from 'react';
import { Search, Newspaper, Moon, Sun, AlertCircle, Loader2 } from 'lucide-react';
import './App.css';


interface Article {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('general');
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const categories = ['general', 'technology', 'business', 'sports', 'health', 'entertainment', 'science'];

  useEffect(() => {
  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockArticles = generateMockArticles(page, searchQuery, category);
        
        if (page === 1) {
          setArticles(mockArticles);
        } else {
          setArticles(prev => [...prev, ...mockArticles]);
        }
        setHasMore(page < 3);
      } else {
        let url = '';
        if (searchQuery) {
          url = `https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&max=10&page=${page}&apikey=${API_KEY}`;
        } else {
          url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&page=${page}&apikey=${API_KEY}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const data = await response.json();
        
        if (page === 1) {
          setArticles(data.articles);
        } else {
          setArticles(prev => [...prev, ...data.articles]);
        }
        setHasMore(data.articles.length === 10);
      }
    } catch (err) {
      setError('Failed to load news. Please check your API key or try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchNews();
}, [searchQuery, category, page]);

  const generateMockArticles = (page: number, query: string, cat: string): Article[] => {
    const topics = query || cat;
    const start = (page - 1) * 10;
    
    return Array.from({ length: 10 }, (_, i) => ({
      title: `${topics.charAt(0).toUpperCase() + topics.slice(1)} News Article ${start + i + 1}`,
      description: `This is a sample news article about ${topics}. In a real application with an API key, you would see actual news content here. The article provides comprehensive coverage of recent developments.`,
      image: `https://picsum.photos/seed/${start + i}/600/400`,
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      source: { name: 'News Source' }
    }));
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
    setArticles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
    setArticles([]);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div className="logo">
              <Newspaper className="logo-icon" />
              <h1>NewsHub</h1>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
            >
              {darkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
            </button>
          </div>

          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for news..."
              className="search-input"
            />
            {searchInput && (
              <button
                onClick={handleSearch}
                className="search-button"
              >
                Search
              </button>
            )}
          </div>

          <div className="categories">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`category-btn ${category === cat ? 'active' : ''}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

     

      <main className="main-content">
        {loading && page === 1 && (
          <div className="loading">
            <Loader2 className="loading-icon" />
            <p>Loading news...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            <div className="articles-grid">
              {articles.map((article, index) => (
                <article
                  key={index}
                  className="article-card"
                >
                  <div className="article-image">
                    <img
                      src={article.image || 'https://via.placeholder.com/600x400?text=No+Image'}
                      alt={article.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+Image';
                      }}
                    />
                    <div className="article-source">
                      <span>{article.source?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="article-content">
                    <p className="article-date">
                      {formatDate(article.publishedAt)}
                    </p>
                    
                    <h2 className="article-title">
                      {article.title}
                    </h2>
                    
                    <p className="article-description">
                      {article.description || 'No description available.'}
                    </p>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="read-more"
                    >
                      Read More
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="load-more-btn"
                >
                  {loading ? (
                    <span className="loading-text">
                      <Loader2 className="loading-spinner" />
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="no-articles">
            <Newspaper className="no-articles-icon" />
            <p>No articles found. Try a different search or category.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Built with React & CSS • News Feed Application</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
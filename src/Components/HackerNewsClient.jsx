import React, { useState, useEffect } from "react";
import axios from "axios";

const HackerNewsClient = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const response = await axios.get(
        `https://hacker-news.firebaseio.com/v0/newstories.json`
      );
      const newsIds = response.data.slice(0, 10);
      const newsData = await Promise.all(
        newsIds.map(async (id) => {
          const newsItemResponse = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          return newsItemResponse.data;
        })
      );
      setNews(newsData);
      setLoading(false);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page > 1) {
      const fetchMoreNews = async () => {
        setLoading(true);
        const response = await axios.get(
          `https://hacker-news.firebaseio.com/v0/newstories.json`
        );
        const startIndex = (page - 1) * 10;
        const endIndex = page * 10;
        const newsIds = response.data.slice(startIndex, endIndex);
        const newsData = await Promise.all(
          newsIds.map(async (id) => {
            const newsItemResponse = await axios.get(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`
            );
            return newsItemResponse.data;
          })
        );
        setNews((prevNews) => [...prevNews, ...newsData]);
        setLoading(false);
      };
      fetchMoreNews();
    }
  }, [page]);

  const handleNewsClick = (newsItem) => {
    const updatedNews = news.map((item) => {
      if (item.id === newsItem.id) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    setNews(updatedNews);
  };

  return (
    <div>
    {news.map(newsItem => (
      <div key={newsItem?.id}>
        {newsItem && newsItem.title ? (
          <>
            <h3 onClick={() => handleNewsClick(newsItem)}>{newsItem.title}</h3>
            {newsItem.expanded && (
              <div>
                <p>Author: {newsItem.by}</p>
                <p>Score: {newsItem.score}</p>
                <p>Comments: {newsItem.descendants}</p>
                <p>URL: <a href={newsItem.url} target="_blank" rel="noopener noreferrer">{newsItem.url}</a></p>
              </div>
            )}
          </>
        ) : null}
      </div>
    ))}
    {loading && <p>Loading...</p>}
  </div>
  );
};

export default HackerNewsClient;

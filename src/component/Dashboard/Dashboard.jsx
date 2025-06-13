import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const images = [
  process.env.PUBLIC_URL + "/img/image.jpg",
  process.env.PUBLIC_URL + "/img/image1.jpg",
  process.env.PUBLIC_URL + "/img/image2.jpg",
  process.env.PUBLIC_URL + "/img/image33.jpg",
];

const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="content-section">
        <div className="quotes">
          <h1>“Great businesses start with great ideas.”</h1>
          <p>Empower your vision with smart decisions and bold execution.</p>

          <h1>“Success favors the responsive.”</h1>
          <p>Quick, thoughtful action wins every time.</p>

          <h1>“Dream big. Start small. Act now.”</h1>
          <p>Progress is built one smart move at a time.</p>
        </div>
        <div className="image-slider">
          <img
            className="slider-image"
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

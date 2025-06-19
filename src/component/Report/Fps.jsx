import React from "react";
import "./Fps.css";

const Fps = () => {
  return (
    <div className="coming-soon-container">
      <img
        className="slider-image"
        src={process.env.PUBLIC_URL + "/img/soon.gif"}
        style={{ width: "50%", height: "60%" }}
        alt="Coming Soon"
      />
    </div>
  );
};
export default Fps;

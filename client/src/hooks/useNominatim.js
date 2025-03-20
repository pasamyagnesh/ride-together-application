// src/hooks/useNominatim.js
import { useState, useEffect } from "react";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const useNominatim = (searchText) => {
  const [listPlace, setListPlace] = useState([]);

  useEffect(() => {
    if (searchText.length < 2) {
      setListPlace([]);
      return;
    }

    const params = {
      q: searchText,
      format: "json",
      addressdetails: 1,
      polygon_geojson: 0,
    };
    const queryString = new URLSearchParams(params).toString();
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "RideTogetherApp/1.0 (your-email@example.com)", // Replace with your email
      },
    };

    fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        setListPlace(JSON.parse(result));
      })
      .catch((err) => console.error("Nominatim error:", err));
  }, [searchText]);

  return listPlace;
};

export default useNominatim;
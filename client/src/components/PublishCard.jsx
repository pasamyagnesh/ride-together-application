// src/components/PublishCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import useNominatim from "../hooks/useNominatim";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import OutlinedInput from "@mui/material/OutlinedInput";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const apiUri = import.meta.env.VITE_REACT_API_URI;

const PublishCard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    origin: { place: "", lat: null, lng: null },
    destination: { place: "", lat: null, lng: null },
    availableSeats: 1,
    startTime: "",
    endTime: "",
    price: 0,
  });

  const [fromSearchText, setFromSearchText] = useState("");
  const [toSearchText, setToSearchText] = useState("");
  const fromSuggestions = useNominatim(fromSearchText);
  const toSuggestions = useNominatim(toSearchText);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" or "error"
  });
  const [route, setRoute] = useState([]); // Store the route coordinates
  const [distance, setDistance] = useState(null); // Store the distance in kilometers

  // Fetch the route and distance using OSRM when both origin and destination are selected
  useEffect(() => {
    if (formData.origin.lat && formData.destination.lat) {
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${formData.origin.lng},${formData.origin.lat};${formData.destination.lng},${formData.destination.lat}?overview=full&geometries=geojson`;
      fetch(osrmUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates.map((coord) => [
              coord[1], // Latitude
              coord[0], // Longitude
            ]);
            setRoute(routeCoordinates);
            // Extract distance (in meters) and convert to kilometers
            const distanceInMeters = data.routes[0].distance;
            const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert to km and round to 2 decimal places
            setDistance(distanceInKm);
          }
        })
        .catch((err) => {
          console.error("Error fetching route:", err);
          setSnackbar({
            open: true,
            message: "Failed to fetch route. Please try again.",
            severity: "error",
          });
        });
    }
  }, [formData.origin, formData.destination]);

  const handleFromSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      origin: {
        place: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
    }));
    setFromSearchText(item.display_name);
    setFromSuggestions([]);
  };

  const handleToSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      destination: {
        place: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
    }));
    setToSearchText(item.display_name);
    setToSuggestions([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Log the form data and API URI for debugging
      console.log("Submitting form data:", formData);
      console.log("API URI:", apiUri);

      const response = await axios.post(`${apiUri}/rides`, formData, { withCredentials: true });
      console.log("Publish successful:", response.data);
      setSnackbar({
        open: true,
        message: "Ride created successfully!",
        severity: "success",
      });

      // Redirect to the homepage or a confirmation page after successful submission
      setTimeout(() => {
        navigate("/"); // Redirect to homepage
      }, 2000); // Delay to allow the snackbar to be visible
    } catch (err) {
      console.error("POST request failed:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: "Failed to create ride. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const ResetCenterView = ({ origin, destination }) => {
    const map = useMap();
    useEffect(() => {
      const bounds = L.latLngBounds();
      if (origin.lat) bounds.extend([origin.lat, origin.lng]);
      if (destination.lat) bounds.extend([destination.lat, destination.lng]);
      if (origin.lat || destination.lat) map.fitBounds(bounds);
    }, [origin, destination]);
    return null;
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      {/* Left Half: Form */}
      <div className="col-span-1 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create a Ride</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block mb-1">From</label>
            <OutlinedInput
              style={{ width: "100%" }}
              value={fromSearchText}
              onChange={(e) => setFromSearchText(e.target.value)}
              placeholder="Enter starting location"
            />
            {fromSuggestions.length > 0 && (
              <List component="nav" aria-label="from suggestions">
                {fromSuggestions.map((item) => (
                  <div key={item.place_id}>
                    <ListItem button onClick={() => handleFromSelect(item)}>
                      <ListItemIcon>
                        <img
                          src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
                          alt="Marker"
                          style={{ width: 25, height: 41 }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={item.display_name} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1">To</label>
            <OutlinedInput
              style={{ width: "100%" }}
              value={toSearchText}
              onChange={(e) => setToSearchText(e.target.value)}
              placeholder="Enter destination"
            />
            {toSuggestions.length > 0 && (
              <List component="nav" aria-label="to suggestions">
                {toSuggestions.map((item) => (
                  <div key={item.place_id}>
                    <ListItem button onClick={() => handleToSelect(item)}>
                      <ListItemIcon>
                        <img
                          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                          alt="Marker"
                          style={{ width: 25, height: 41 }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={item.display_name} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Available Seats</label>
            <input
              type="number"
              min="1"
              value={formData.availableSeats}
              onChange={(e) => setFormData((prev) => ({ ...prev, availableSeats: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Price</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Departure Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Arrival Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          {/* Display Distance */}
          {distance && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg shadow-md">
              <p className="text-lg font-semibold">
                Distance: {distance} km
              </p>
            </div>
          )}
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Publish
          </button>
        </form>
      </div>

      {/* Right Half: Map */}
      <div className="col-span-1">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          style={{ height: "80vh", width: "100%" }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResetCenterView origin={formData.origin} destination={formData.destination} />
          {formData.origin.lat && (
            <Marker position={[formData.origin.lat, formData.origin.lng]} />
          )}
          {formData.destination.lat && (
            <Marker position={[formData.destination.lat, formData.destination.lng]} icon={redIcon} />
          )}
          {route.length > 0 && (
            <Polyline positions={route} color="blue" weight={4} />
          )}
        </MapContainer>
      </div>

      {/* Snackbar for Success/Failure Messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PublishCard;
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/live-data";
const LOCATION_URL = "http://127.0.0.1:8000/api/locations";

export const fetchLiveData = async (location, lat, lng, locationName) => {
  const response = await axios.get(API_URL, {
    params: {
      location,
      lat,
      lng,
      location_name: locationName,
    },
  });
  return response.data;
};

export const fetchLocations = async () => {
  const response = await axios.get(LOCATION_URL);
  return response.data;
};

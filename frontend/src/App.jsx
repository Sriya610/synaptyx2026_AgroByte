import { useEffect, useState } from "react";
import { fetchLiveData } from "./api";
import "./App.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await fetchLiveData();
        setData(result);
      } catch (error) {
        console.error("API Error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return <h2>Loading AgriGuard AI...</h2>;

  return (
    <div className="container">
      <h1>AgriGuard AI</h1>
      <h3>Smart Crop Stress Monitoring System</h3>

      <div className="card">
        <p>🌡 Temperature: {data.temperature} °C</p>
        <p>💧 Humidity: {data.humidity} %</p>
        <p>🌱 Soil Moisture: {data.soil_moisture} %</p>
      </div>

      <div className="csi">
        <h2>Crop Stress Index: {data.csi}</h2>
        <h3>Status: {data.status}</h3>
      </div>

      {data.alert && (
        <div className="alert">
          {data.alert}
        </div>
      )}
    </div>
  );
}

export default App;
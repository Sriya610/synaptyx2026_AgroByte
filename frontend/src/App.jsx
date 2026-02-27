import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { fetchLiveData, fetchLocations } from "./api";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const MAX_POINTS = 24;
const POLL_INTERVAL_MS = 2000;
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function App() {
  const [selectedLocation, setSelectedLocation] = useState("dynamic-location");
  const [searchLocation, setSearchLocation] = useState("");
  const [dynamicLocationName, setDynamicLocationName] = useState("");
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(false);
  const searchInputRef = useRef(null);
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!MAPS_API_KEY) {
      setMapsError("Google Maps key missing. Set VITE_GOOGLE_MAPS_API_KEY.");
      return;
    }

    if (window.google?.maps) {
      setMapsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsReady(true);
    script.onerror = () => setMapsError("Google Maps failed to load.");
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) {
      return;
    }

    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center: { lat: 16.3067, lng: 80.4365 },
      zoom: 7,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapRef.current.addListener("click", (event) => {
      if (!event.latLng) {
        return;
      }
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedCoords({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const place = results[0].formatted_address;
          setDynamicLocationName(place);
          setSearchLocation(place);
          if (results[0].geometry.viewport) {
            mapRef.current.fitBounds(results[0].geometry.viewport);
          }
        } else {
          setDynamicLocationName(`Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setSearchLocation(`Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      });
    });
  }, [mapsReady]);

  useEffect(() => {
    if (!mapsReady || !searchInputRef.current) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["formatted_address", "geometry"],
      types: ["geocode"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry?.location) {
        return;
      }
      
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || searchInputRef.current.value;
      
      setSelectedCoords({ lat, lng });
      setDynamicLocationName(address);
      setSearchLocation(address);

      if (place.geometry.viewport) {
        mapRef.current.fitBounds(place.geometry.viewport);
      } else {
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(15);
      }
    });
  }, [mapsReady]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    if (!selectedCoords) {
      if (circleRef.current) circleRef.current.setMap(null);
      if (markerRef.current) markerRef.current.setMap(null);
      circleRef.current = null;
      markerRef.current = null;
      return;
    }

    // Update or create Circle
    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: selectedCoords,
        radius: 3000,
        fillColor: "#ff4757",
        fillOpacity: 0.1,
        strokeColor: "#ff4757",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        clickable: false
      });
    } else {
      circleRef.current.setCenter(selectedCoords);
    }

    // Update or create Marker
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position: selectedCoords,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      markerRef.current.setPosition(selectedCoords);
    }
  }, [selectedCoords]);

  const handleManualSearch = (e) => {
    if (e) e.preventDefault();
    if (!mapsReady || !searchLocation.trim()) {
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation.trim() }, (results, status) => {
      if (status === "OK" && results && results[0]?.geometry?.location) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        const address = results[0].formatted_address || searchLocation.trim();
        
        setSelectedCoords({ lat, lng });
        setDynamicLocationName(address);
        setSearchLocation(address);
        
        if (results[0].geometry.viewport) {
          mapRef.current.fitBounds(results[0].geometry.viewport);
        } else {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(15);
        }
      }
    });
  };

  useEffect(() => {
    setHistory([]);
    setLiveData(null);
    setLastUpdated(null);
  }, [selectedLocation, selectedCoords]);

  useEffect(() => {
    let mounted = true;

    const pullData = async () => {
      if (!selectedCoords) return;

      try {
        const result = await fetchLiveData(
          selectedLocation,
          selectedCoords?.lat,
          selectedCoords?.lng,
          dynamicLocationName,
        );
        if (!mounted) {
          return;
        }

        const timestamp = new Date();
        setConnected(true);
        setLiveData(result);
        setLastUpdated(timestamp);
        setHistory((prev) => {
          const next = [
            ...prev,
            {
              time: timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              temperature: result.temperature,
              humidity: result.humidity,
              soilMoisture: result.soil_moisture,
              csi: result.csi,
            },
          ];
          return next.slice(-MAX_POINTS);
        });
      } catch (error) {
        if (mounted) {
          setConnected(false);
        }
        console.error("Live API error:", error);
      }
    };

    pullData();
    const interval = setInterval(pullData, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dynamicLocationName, selectedCoords?.lat, selectedCoords?.lng, selectedLocation]);

  const chartData = useMemo(
    () => ({
      labels: history.map((point) => point.time),
      datasets: [
        {
          label: "Temperature (C)",
          data: history.map((point) => point.temperature),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.18)",
          tension: 0.3,
        },
        {
          label: "Humidity (%)",
          data: history.map((point) => point.humidity),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.16)",
          tension: 0.3,
        },
        {
          label: "Soil Moisture (%)",
          data: history.map((point) => point.soilMoisture),
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.15)",
          tension: 0.3,
        },
      ],
    }),
    [history],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20 },
          grid: { color: "rgba(15, 23, 42, 0.08)" },
        },
        x: {
          grid: { color: "rgba(15, 23, 42, 0.06)" },
        },
      },
    }),
    [],
  );

  const statusClass = liveData?.status?.toLowerCase().replace(/\s+/g, "-") || "";
  const csiValue = liveData ? Math.min(Math.max(liveData.csi, 0), 100) : 0;
  const alertMessages = [];

  if (liveData) {
    if (csiValue >= 80) {
      alertMessages.push({
        key: "csi-critical",
        level: "critical",
        text: `Critical crop stress (${csiValue}%). Immediate irrigation and canopy cooling needed.`,
      });
    } else if (csiValue >= 60) {
      alertMessages.push({
        key: "csi-high",
        level: "warning",
        text: `High crop stress (${csiValue}%). Increase irrigation frequency and monitor within 30 minutes.`,
      });
    } else if (csiValue >= 30) {
      alertMessages.push({
        key: "csi-moderate",
        level: "warning",
        text: `Moderate crop stress (${csiValue}%). Check field conditions and prepare preventive irrigation.`,
      });
    }

    if (liveData.temperature >= 38) {
      alertMessages.push({
        key: "temp-high",
        level: "critical",
        text: `Temperature spike: ${liveData.temperature} C. Heat stress risk is high.`,
      });
    }
    if (liveData.humidity <= 35) {
      alertMessages.push({
        key: "humidity-low",
        level: "warning",
        text: `Low humidity: ${liveData.humidity}%. Evapotranspiration losses may increase.`,
      });
    }
    if (liveData.soil_moisture <= 30) {
      alertMessages.push({
        key: "soil-low",
        level: "critical",
        text: `Low soil moisture: ${liveData.soil_moisture}%. Irrigation recommended now.`,
      });
    }

    if (liveData.alert) {
      alertMessages.push({
        key: "backend-alert",
        level: "critical",
        text: liveData.alert.replace(/[^\x20-\x7E]/g, "").trim() || "High crop stress detected.",
      });
    }
  }

  const hasCriticalAlert = alertMessages.some((alert) => alert.level === "critical");

  const dialData = {
    labels: ["CSI", "Remaining"],
    datasets: [
      {
        data: [csiValue, 100 - csiValue],
        backgroundColor: ["#b22222", "rgba(16, 34, 26, 0.12)"],
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const dialOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <main className={`app-shell ${hasCriticalAlert ? "screen-alert" : ""}`}>
      <header className="topbar">
        <div>
          <h1>AgriGuard AI</h1>
          <p className="subtitle">Smart Crop Stress Realtime Dashboard</p>
          <p className="subtitle location-tag">
            {liveData ? `${liveData.location_name} (${liveData.region})` : "Search for a location to start monitoring"}
          </p>
        </div>
        <div className="meta">
          <label className="location-control">
            Search Location
            <form className="search-row" onSubmit={handleManualSearch}>
              <input
                ref={searchInputRef}
                className="location-input"
                type="text"
                value={searchLocation}
                placeholder="Enter village, town, area..."
                onChange={(event) => setSearchLocation(event.target.value)}
              />
              <button
                type="submit"
                className="map-btn"
              >
                Go
              </button>
            </form>
          </label>
          <div className="map-status">{mapsError ? mapsError : "Use search or click map to set location"}</div>
          <span className={`pill ${connected ? "online" : "offline"}`}>
            {connected ? "Live Connected" : "Reconnecting..."}
          </span>
          <span className="timestamp">
            Last update:{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Waiting for first sample"}
          </span>
        </div>
      </header>

      <section className="map-card">
        <h2>Location Map</h2>
        <div ref={mapDivRef} className="map-canvas" />
      </section>

      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-header">
            <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            <h2>Temperature</h2>
          </div>
          <p>{liveData ? `${liveData.temperature} C` : "--"}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-header">
            <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <h2>Humidity</h2>
          </div>
          <p>{liveData ? `${liveData.humidity} %` : "--"}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-header">
            <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <h2>Soil Moisture</h2>
          </div>
          <p>{liveData ? `${liveData.soil_moisture} %` : "--"}</p>
        </article>
        <article className="kpi-card stress-card">
          <div className="kpi-header">
            <svg className="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <h2>Crop Stress Index</h2>
          </div>
          <p>{liveData ? liveData.csi : "--"}</p>
          <div className="dial-wrap">
            <Doughnut data={dialData} options={dialOptions} />
            <span className="dial-value">{csiValue}%</span>
          </div>
          {liveData && <span className={`status-chip ${statusClass}`}>{liveData.status}</span>}
        </article>
      </section>

      <section className="chart-card">
        <div className="chart-header">
          <h2>Sensor Trends</h2>
          <p>Rolling window: last {MAX_POINTS} samples (2s refresh)</p>
        </div>
        <div className="chart-wrap">
          <Line options={chartOptions} data={chartData} />
        </div>
      </section>

      {alertMessages.length > 0 ? (
        <section className="alerts-stack">
          {alertMessages.map((alert) => (
            <div key={alert.key} className={`alert-banner ${alert.level}`}>
              {alert.text}
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default App;

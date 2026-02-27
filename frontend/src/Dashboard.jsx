import { useEffect, useState } from "react";
import SensorCharts from "../components/SensorCharts";

function Dashboard() {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/sensor-data")
      .then(res => res.json())
      .then(data => setSensorData(data));
  }, []);

  const [alert, setAlert] = useState(false);

useEffect(() => {
  fetch("http://localhost:8000/check-alert")
    .then(res => res.json())
    .then(data => {
      if (data.alert === true) {
        setAlert(true);
      } else {
        setAlert(false);
      }
    });
}, []);

  return (
    <div>
      <h2>AgriGuard Monitoring Dashboard</h2>
      <SensorCharts data={sensorData} />
      <className={alert ? "alert-active" : ""}/>
    </div>
    
  );

}

export default Dashboard;


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI(title="AgriGuard AI API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_data():
    temp = round(random.uniform(20, 45), 2)
    humidity = round(random.uniform(20, 90), 2)
    soil = round(random.uniform(10, 80), 2)

    # Crop Stress Index
    temp_stress = (temp - 20) / 25
    humidity_stress = (90 - humidity) / 70
    moisture_stress = (80 - soil) / 70

    csi = round((0.4 * temp_stress +
                 0.3 * humidity_stress +
                 0.3 * moisture_stress) * 100, 2)

    status = "Healthy"
    if csi > 30:
        status = "Moderate"
    if csi > 60:
        status = "High Risk"
    if csi > 80:
        status = "Critical"

    alert = ""
    if csi > 75:
        alert = "⚠ High Crop Stress – Irrigation Recommended"

    return {
        "temperature": temp,
        "humidity": humidity,
        "soil_moisture": soil,
        "csi": csi,
        "status": status,
        "alert": alert
    }

@app.get("/api/live-data")
def get_live_data():
    return generate_data()
from fastapi import FastAPI, Query
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


def profile(name: str, region: str, temperature, humidity, soil_moisture):
    return {
        "name": name,
        "region": region,
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
    }


LOCATION_PROFILES = {
    # Andhra Pradesh - high agriculture districts/areas
    "anantapur-ap": profile("Anantapur", "Andhra Pradesh", (24, 41), (28, 64), (16, 52)),
    "dharmavaram-ap": profile("Dharmavaram", "Andhra Pradesh", (24, 40), (30, 66), (18, 55)),
    "hindupur-ap": profile("Hindupur", "Andhra Pradesh", (23, 39), (30, 65), (18, 54)),
    "kurnool-ap": profile("Kurnool", "Andhra Pradesh", (24, 40), (32, 68), (18, 56)),
    "nandyal-ap": profile("Nandyal", "Andhra Pradesh", (23, 39), (36, 72), (22, 62)),
    "kadapa-ap": profile("Kadapa", "Andhra Pradesh", (24, 40), (30, 66), (18, 55)),
    "chittoor-ap": profile("Chittoor", "Andhra Pradesh", (22, 37), (42, 78), (24, 66)),
    "madanapalle-ap": profile("Madanapalle", "Andhra Pradesh", (20, 34), (45, 80), (28, 68)),
    "tirupati-rural-ap": profile("Tirupati Rural", "Andhra Pradesh", (23, 37), (45, 82), (26, 68)),
    "nellore-ap": profile("Nellore", "Andhra Pradesh", (25, 36), (58, 88), (36, 80)),
    "kavali-ap": profile("Kavali", "Andhra Pradesh", (25, 36), (56, 86), (34, 78)),
    "prakasham-ap": profile("Prakasam", "Andhra Pradesh", (24, 38), (44, 78), (24, 66)),
    "ongole-ap": profile("Ongole", "Andhra Pradesh", (24, 37), (48, 80), (26, 68)),
    "guntur-ap": profile("Guntur", "Andhra Pradesh", (24, 37), (52, 84), (32, 76)),
    "tenali-ap": profile("Tenali", "Andhra Pradesh", (24, 36), (58, 88), (40, 82)),
    "bapatla-ap": profile("Bapatla", "Andhra Pradesh", (25, 36), (60, 90), (42, 84)),
    "narasaraopet-ap": profile("Narasaraopet", "Andhra Pradesh", (24, 37), (50, 82), (30, 72)),
    "krishna-ap": profile("Krishna Delta", "Andhra Pradesh", (24, 36), (58, 88), (40, 82)),
    "machilipatnam-ap": profile("Machilipatnam", "Andhra Pradesh", (25, 35), (62, 90), (42, 84)),
    "vijayawada-rural-ap": profile("Vijayawada Rural", "Andhra Pradesh", (24, 37), (54, 86), (34, 78)),
    "nuzvid-ap": profile("Nuzvid", "Andhra Pradesh", (24, 37), (50, 84), (32, 76)),
    "eluru-ap": profile("Eluru", "Andhra Pradesh", (24, 36), (56, 88), (38, 82)),
    "tadepalligudem-ap": profile("Tadepalligudem", "Andhra Pradesh", (24, 36), (58, 88), (40, 84)),
    "bhimavaram-ap": profile("Bhimavaram", "Andhra Pradesh", (24, 35), (62, 90), (42, 84)),
    "palakollu-ap": profile("Palakollu", "Andhra Pradesh", (24, 35), (62, 90), (44, 85)),
    "east-godavari-ap": profile("East Godavari", "Andhra Pradesh", (24, 36), (58, 88), (40, 84)),
    "kakinada-ap": profile("Kakinada", "Andhra Pradesh", (25, 35), (62, 90), (42, 84)),
    "rajamahendravaram-rural-ap": profile("Rajamahendravaram Rural", "Andhra Pradesh", (24, 36), (56, 86), (38, 82)),
    "konaseema-ap": profile("Konaseema", "Andhra Pradesh", (24, 35), (64, 92), (46, 86)),
    "amalapuram-ap": profile("Amalapuram", "Andhra Pradesh", (24, 35), (66, 92), (46, 88)),
    "kovvur-ap": profile("Kovvur", "Andhra Pradesh", (24, 36), (58, 88), (40, 84)),
    "vizianagaram-ap": profile("Vizianagaram", "Andhra Pradesh", (23, 35), (56, 86), (34, 78)),
    "srikakulam-ap": profile("Srikakulam", "Andhra Pradesh", (24, 35), (60, 88), (36, 80)),
    "anakapalli-ap": profile("Anakapalli", "Andhra Pradesh", (24, 35), (60, 88), (38, 80)),
    "narsipatnam-ap": profile("Narsipatnam", "Andhra Pradesh", (23, 34), (62, 88), (40, 82)),

    # Telangana - high agriculture districts/areas
    "adilabad-ts": profile("Adilabad", "Telangana", (22, 37), (40, 78), (24, 64)),
    "nirmal-ts": profile("Nirmal", "Telangana", (22, 37), (42, 78), (24, 64)),
    "mancherial-ts": profile("Mancherial", "Telangana", (23, 38), (38, 74), (22, 62)),
    "komaram-bheem-ts": profile("Komaram Bheem", "Telangana", (22, 37), (40, 76), (24, 64)),
    "nizamabad-ts": profile("Nizamabad", "Telangana", (22, 36), (46, 82), (28, 70)),
    "armur-ts": profile("Armur", "Telangana", (22, 36), (46, 80), (28, 70)),
    "kamareddy-ts": profile("Kamareddy", "Telangana", (22, 36), (46, 82), (28, 70)),
    "karimnagar-ts": profile("Karimnagar", "Telangana", (23, 37), (42, 78), (26, 68)),
    "jagtial-ts": profile("Jagtial", "Telangana", (23, 37), (44, 80), (28, 70)),
    "peddapalli-ts": profile("Peddapalli", "Telangana", (23, 37), (42, 78), (26, 68)),
    "rajanna-sircilla-ts": profile("Rajanna Sircilla", "Telangana", (23, 36), (44, 78), (28, 68)),
    "siddipet-ts": profile("Siddipet", "Telangana", (23, 37), (40, 76), (24, 66)),
    "medak-ts": profile("Medak", "Telangana", (23, 36), (42, 78), (26, 68)),
    "sangareddy-ts": profile("Sangareddy", "Telangana", (23, 36), (40, 76), (24, 66)),
    "narayankhed-ts": profile("Narayankhed", "Telangana", (23, 36), (40, 76), (24, 66)),
    "warangal-rural-ts": profile("Warangal Rural", "Telangana", (23, 36), (46, 80), (28, 70)),
    "hanamkonda-ts": profile("Hanamkonda", "Telangana", (23, 36), (44, 78), (26, 68)),
    "mahabubabad-ts": profile("Mahabubabad", "Telangana", (23, 37), (44, 80), (28, 70)),
    "khammam-ts": profile("Khammam", "Telangana", (23, 36), (50, 84), (30, 74)),
    "bhadradri-ts": profile("Bhadradri Kothagudem", "Telangana", (23, 35), (52, 86), (32, 76)),
    "nalgonda-ts": profile("Nalgonda", "Telangana", (24, 38), (38, 74), (22, 62)),
    "suryapet-ts": profile("Suryapet", "Telangana", (24, 38), (38, 74), (22, 62)),
    "yadadri-ts": profile("Yadadri Bhuvanagiri", "Telangana", (23, 37), (40, 76), (24, 66)),
    "jangaon-ts": profile("Jangaon", "Telangana", (23, 37), (42, 78), (24, 66)),
    "mahabubnagar-ts": profile("Mahabubnagar", "Telangana", (24, 39), (34, 70), (20, 60)),
    "jadcherla-ts": profile("Jadcherla", "Telangana", (24, 39), (34, 70), (20, 60)),
    "wanaparthy-ts": profile("Wanaparthy", "Telangana", (24, 39), (34, 70), (20, 60)),
    "nagarkurnool-ts": profile("Nagarkurnool", "Telangana", (24, 39), (34, 70), (20, 60)),
    "gadwal-ts": profile("Jogulamba Gadwal", "Telangana", (24, 39), (32, 68), (18, 58)),
    "vikarabad-ts": profile("Vikarabad", "Telangana", (22, 35), (42, 78), (26, 68)),

    # Existing global demo locations
    "coimbatore": profile("Coimbatore", "India", (24, 39), (35, 78), (22, 68)),
    "punjab": profile("Punjab Plains", "India", (18, 41), (28, 72), (20, 64)),
    "phoenix": profile("Phoenix", "USA", (26, 45), (18, 45), (12, 52)),
    "california-valley": profile("California Central Valley", "USA", (16, 37), (30, 70), (18, 60)),
    "holland-greenhouse": profile("Holland Greenhouse", "Netherlands", (19, 30), (45, 82), (40, 78)),
}


def resolve_location(location: str):
    location_key = location.strip().lower()
    if location_key in LOCATION_PROFILES:
        return location_key, LOCATION_PROFILES[location_key]
    for key, value in LOCATION_PROFILES.items():
        name = value["name"].strip().lower()
        if location_key and (location_key in name or name in location_key):
            return key, value
    return "guntur-ap", LOCATION_PROFILES["guntur-ap"]


def clamp(value: float, low: float, high: float):
    return max(low, min(high, value))


def dynamic_profile_from_coordinates(lat: float, lng: float):
    abs_lat = abs(lat)
    temp_center = clamp(36 - (abs_lat * 0.30), 16, 39)
    humidity_center = clamp(78 - (abs_lat * 0.70), 28, 88)
    soil_center = clamp(38 + ((humidity_center - 55) * 0.45), 16, 86)

    # Simple coastal lift: longitudes around east/west coasts receive humidity boost.
    coastal_boost = 6 if (67 <= abs(lng) <= 83 or 117 <= abs(lng) <= 124) else 0
    humidity_center = clamp(humidity_center + coastal_boost, 30, 92)
    soil_center = clamp(soil_center + coastal_boost * 0.35, 18, 88)

    return {
        "name": "Dynamic Location",
        "region": "Map Selected",
        "temperature": (clamp(temp_center - 4, 10, 45), clamp(temp_center + 4, 14, 48)),
        "humidity": (clamp(humidity_center - 12, 10, 95), clamp(humidity_center + 8, 20, 98)),
        "soil_moisture": (clamp(soil_center - 14, 5, 95), clamp(soil_center + 10, 10, 98)),
    }


def generate_data(location: str, lat: float | None = None, lng: float | None = None, location_name: str | None = None):
    if lat is not None and lng is not None:
        location_key = "dynamic-location"
        profile_data = dynamic_profile_from_coordinates(lat, lng)
        if location_name and location_name.strip():
            profile_data["name"] = location_name.strip()
    else:
        location_key, profile_data = resolve_location(location)

    temp = round(random.uniform(*profile_data["temperature"]), 2)
    humidity = round(random.uniform(*profile_data["humidity"]), 2)
    soil = round(random.uniform(*profile_data["soil_moisture"]), 2)

    # Crop Stress Index
    temp_stress = (temp - 20) / 25
    humidity_stress = (90 - humidity) / 70
    moisture_stress = (80 - soil) / 70

    csi = round((0.4 * temp_stress + 0.3 * humidity_stress + 0.3 * moisture_stress) * 100, 2)

    status = "Healthy"
    if csi > 30:
        status = "Moderate"
    if csi > 60:
        status = "High Risk"
    if csi > 80:
        status = "Critical"

    alert = ""
    if csi > 75:
        alert = "High crop stress - irrigation recommended"

    return {
        "location": location_key,
        "location_name": profile_data["name"],
        "region": profile_data["region"],
        "lat": lat,
        "lng": lng,
        "temperature": temp,
        "humidity": humidity,
        "soil_moisture": soil,
        "csi": csi,
        "status": status,
        "alert": alert,
    }


@app.get("/api/locations")
def get_locations():
    locations = [
        {
            "id": key,
            "name": value["name"],
            "region": value["region"],
        }
        for key, value in LOCATION_PROFILES.items()
    ]
    return sorted(locations, key=lambda item: (item["region"], item["name"]))


@app.get("/api/live-data")
def get_live_data(
    location: str = Query(default="guntur-ap"),
    lat: float | None = Query(default=None),
    lng: float | None = Query(default=None),
    location_name: str | None = Query(default=None),
):
    return generate_data(location, lat, lng, location_name)

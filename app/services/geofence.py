import math
import os

from dotenv import load_dotenv

load_dotenv()

OFFICE_LATITUDE = float(os.getenv("OFFICE_LATITUDE"))
OFFICE_LONGITUDE = float(os.getenv("OFFICE_LONGITUDE"))
GEOFENCE_RADIUS_METERS = float(
    os.getenv("GEOFENCE_RADIUS_METERS", "50")
)


def calculate_distance(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> float:

    earth_radius = 6371000

    lat1 = math.radians(latitude1)
    lat2 = math.radians(latitude2)

    delta_lat = math.radians(latitude2 - latitude1)
    delta_lon = math.radians(longitude2 - longitude1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius * c


def is_inside_geofence(
    latitude: float,
    longitude: float,
) -> tuple[bool, float]:

    distance = calculate_distance(
        OFFICE_LATITUDE,
        OFFICE_LONGITUDE,
        latitude,
        longitude,
    )

    return (
        distance <= GEOFENCE_RADIUS_METERS,
        round(distance, 2),
    )

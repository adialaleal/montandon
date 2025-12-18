"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Leaflet with Next.js/React
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  lat: number;
  lng: number;
}

interface CrawlerItem {
  title: string;
  phone: string;
  location: Location;
}

interface ClientMapProps {
  data: CrawlerItem[];
}

export default function ClientMap({ data }: ClientMapProps) {
  // Center on Brasilia by default or the first point
  const center: [number, number] = [-15.7975, -47.8919];

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border">
      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((item, index) => {
          if (!item.location || !item.location.lat || !item.location.lng) return null;
          return (
            <Marker
              key={index}
              position={[item.location.lat, item.location.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.phone}</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

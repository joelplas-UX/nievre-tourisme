import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

// Fix default marker icon (Vite bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Saint-Sulpice (58270) coordinates
const CENTER = [47.0217, 3.7153];

const eventIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const activityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function MapSection({ events, activities, lang, tr }) {
  const eventMarkers = useMemo(() =>
    events.filter(e => e.lat && e.lng),
    [events]
  );
  const activityMarkers = useMemo(() =>
    activities.filter(a => a.lat && a.lng),
    [activities]
  );

  return (
    <section className="map-section">
      <div className="section-header">
        <h2>{tr.map.title}</h2>
        <p>{tr.map.subtitle}</p>
      </div>
      <div className="map-legend">
        <span className="legend-item"><span className="dot red" /> {tr.nav.events}</span>
        <span className="legend-item"><span className="dot green" /> {tr.nav.activities}</span>
      </div>
      <div className="map-container">
        <MapContainer center={CENTER} zoom={10} scrollWheelZoom={false} style={{ height: '460px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {eventMarkers.map(e => (
            <Marker key={e.id} position={[e.lat, e.lng]} icon={eventIcon}>
              <Popup>
                <strong>{e.title?.[lang] || e.title?.fr}</strong><br />
                {e.location}
              </Popup>
            </Marker>
          ))}
          {activityMarkers.map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={activityIcon}>
              <Popup>
                <strong>{a.title?.[lang] || a.title?.fr}</strong><br />
                {a.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

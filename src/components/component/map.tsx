import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

interface MyMapProps {
  position: [number, number];
  zoom: number;
  institutions: any[];
  onMarkerClick: (institution: any) => void;
  onMapMove: (center: [number, number]) => void;
}

const MyMap: React.FC<MyMapProps> = ({ position, zoom, institutions, onMarkerClick, onMapMove }) => {
  const previousPosition = useRef(position);

  // Componente para centrar el mapa cuando la posición cambie
  const MapCenterer = ({ position }: { position: [number, number] }) => {
    const map = useMapEvents({
      moveend: () => {
        const newCenter = map.getCenter();
        onMapMove([newCenter.lat, newCenter.lng]);
      },
    });

    useEffect(() => {
      // Only set view if the position has changed
      if (
        previousPosition.current[0] !== position[0] ||
        previousPosition.current[1] !== position[1]
      ) {
        map.setView(position, map.getZoom());
        previousPosition.current = position; // Update previous position to the current one
      }
    }, [position]);

    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {institutions.map((inst) => (
        <Marker
          key={inst._id}
          position={[inst.Latitud, inst.Longitud]}
          eventHandlers={{
            click: () => onMarkerClick(inst),
          }}
        >
          <Popup>
            {inst.NOM_INSTIT} <br /> {inst.DPA_DESPAR}, {inst.DPA_DESCAN}, {inst.DPA_DESPRO}
          </Popup>
        </Marker>
      ))}
      <MapCenterer position={position} />
    </MapContainer>
  );
};

export default MyMap;

"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import axios from 'axios';

const MyMap = dynamic(() => import('@/components/component/map'), { ssr: false });

export function Landing() {
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [mapCenter, setMapCenter] = useState([-0.2097107258001591, -78.50323140621187]); // Inicializamos con el centro inicial
  const [institutions, setInstitutions] = useState([]); // Estado para las instituciones filtradas
  const [weather, setWeather] = useState(null); // Estado para almacenar la información del clima

  // Función para manejar el clic en la lista de instituciones
  const handleListItemClick = (institution: any) => {
    setSelectedInstitution(institution);
    setMapCenter([institution.Latitud, institution.Longitud]); // Centra el mapa en la institución seleccionada
  };

  const handleEnter = async (value: string) => {
    console.log("Enter pressed with value:", value);
    console.log("Current map center:", mapCenter);

    // Realizar la petición a la API
    let data = JSON.stringify({
      "dataSource": "Cluster0",
      "database": "InstitucionesEducativas",
      "collection": "Instituciones",
      "pipeline": [
        {
          "$match": {
            "location": {
              "$geoWithin": {
                "$centerSphere": [
                  [mapCenter[1], mapCenter[0]], // Latitud y longitud en el formato [longitud, latitud]
                  2 / 6378.1  // Radio en kilómetros dividido por el radio de la Tierra
                ]
              }
            },
            "NOM_INSTIT": {
              "$regex": `.*${value}.*`,
              "$options": "i"
            }
          }
        },
        {
          "$sort": {
            "NOM_INSTIT": 1
          }
        },
        {
          "$limit": 50
        }
      ]
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/api/action/aggregate',  // Usar el proxy configurado en Next.js
      headers: { 
        'Content-Type': 'application/json', 
        'api-key': 'GpFoARJ9dkSV9zVM6E0zSed1wnhFjiTU0XMesLfjPPoITHISr4tmIuAXIdZBQHyK', 
        'Accept': 'application/json'
      },
      data : data
    };

    try {
      const response = await axios.request(config);
      setInstitutions(response.data.documents); // Actualiza el estado con las instituciones encontradas
    } catch (error) {
      console.log(error);
    }
  };

  const handleMapMove = (center: [number, number]) => {
    setMapCenter(center); // Actualizamos el estado con el nuevo centro
  };

  const handleMarkerClick = async (institution: any) => {
    setSelectedInstitution(institution);
    await fetchWeather(institution.Latitud, institution.Longitud);  // Llama a la función para obtener el clima
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const apiKey = 'aa94e37ed3a069cf1ea113c6fd5b7d33';  // API key de OpenWeather
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      setWeather(response.data);  // Almacena la información del clima en el estado
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#ff6b6b] to-[#ffa500] text-white">

      <header className="bg-[#ff6b6b] py-4 px-6">
        <h1 className="text-2xl font-bold">Instituciones Educativas en Ecuador</h1>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-[#ffa500] border-r p-6 overflow-y-auto">
        <Input
          placeholder="Search institutions..."
          onEnter={handleEnter}
          className="mb-6 bg-primary text-primary-foreground placeholder-primary-foreground"
        />
          <ul className="space-y-2">
            {institutions.map((inst) => (
              <li 
                key={inst._id} 
                onClick={() => handleListItemClick(inst)} 
                className="cursor-pointer hover:bg-muted hover:text-muted-foreground p-2 rounded-md"
              >
                {inst.NOM_INSTIT}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 relative flex flex-col">
          <MyMap
            position={mapCenter} // Posición inicial
            zoom={14}
            institutions={institutions} // Pasar la lista real de instituciones
            onMarkerClick={handleMarkerClick}
            onMapMove={handleMapMove} // Manejar movimiento del mapa
          />
          {selectedInstitution && (
            <div className="bg-white text-black p-4">
              <h2 className="text-lg font-bold">{selectedInstitution.NOM_INSTIT}</h2>
              <p>{selectedInstitution.DPA_DESPAR}, {selectedInstitution.DPA_DESCAN}, {selectedInstitution.DPA_DESPRO}</p>
              <p><strong>Sostenimiento:</strong> {selectedInstitution.NOM_SOSTEN}</p>
              <p><strong>Estado:</strong> {selectedInstitution.NOM_ESTAD}</p>
              {weather && (
                <div className="mt-4">
                  <h3 className="font-bold text-lg">Weather Information:</h3>
                  <p><strong>Temperatura:</strong> {weather.main.temp}°C</p>
                  <p><strong>Humedad:</strong> {weather.main.humidity}%</p>
                  <p><strong>Condiciones:</strong> {weather.weather[0].description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

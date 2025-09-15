"use client";

import React, { useState, useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import Image from "next/image";
interface FoodStore {
  name: string;
  address: string;
  specialty: string;
  priceRange: string;
  googleMapsUrl?: string;
  website?: string;
}

interface FoodStreet {
  name: string;
  description: string;
  popularDishes: string[];
  bestTimeToVisit: string;
  topStores: FoodStore[];
}

interface LocalRestriction {
  category: string;
  restriction: string;
  penalty: string;
}

interface EnhancedLocationData {
  coordinates: [number, number];
  title: string;
  country: string;
  city: string;
  famousFoodStreets: FoodStreet[];
  localRestrictions: LocalRestriction[];
  culturalTips: string[];
  currency: string;
  language: string;
  imageUrl?: string;
}

const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[20000]">
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-lg font-medium">Discovering amazing food spots...</span>
      </div>
    </div>
  </div>
);

const OLMapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [locationData, setLocationData] = useState<EnhancedLocationData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [markerLayer, setMarkerLayer] = useState<VectorLayer<VectorSource> | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'food' | 'restrictions' | 'culture'>('overview');
  const [selectedFoodStreet, setSelectedFoodStreet] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const unsplashAccessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
    if (mapRef.current && !mapInstance) {
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([-79.3871, 43.6426]),
          zoom: 11,
        }),
      });
      setMapInstance(initialMap);
    }
  }, [mapRef, mapInstance]);

  useEffect(() => {
    if (locationData && mapInstance) {
      // Clean up previous marker layer
      if (markerLayer) {
        mapInstance.removeLayer(markerLayer);
      }

      const feature = new Feature({
        geometry: new Point(fromLonLat([locationData.coordinates[1], locationData.coordinates[0]])),
        name: locationData.title,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png", // Food pin icon
            scale: 0.08,
          }),
        })
      );

      const vectorSource = new VectorSource({ features: [feature] });
      const vectorLayer = new VectorLayer({ source: vectorSource });

      mapInstance.addLayer(vectorLayer);
      setMarkerLayer(vectorLayer);

      mapInstance.getView().animate({
        center: fromLonLat([locationData.coordinates[1], locationData.coordinates[0]]),
        zoom: 13,
        duration: 1500,
      });

      setShowSidebar(true);
    }
  }, [locationData, mapInstance, markerLayer]); // Include markerLayer in the dependency array

  const fetchLocationImage = async (place: string): Promise<string | null> => {
    if (!unsplashAccessKey) {
      console.log("Unsplash API key not configured, skipping image fetch");
      return null;
    }
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          place + " food street"
        )}&client_id=${unsplashAccessKey}&per_page=1`
      );
      
      if (!response.ok) {
        console.error("Unsplash API error:", response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Use small URL to avoid loading issues and reduce bandwidth
        return data.results[0].urls.small;
      }
      return null;
    } catch (err) {
      console.error("Error fetching image:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!inputValue) return;
  
    setLoading(true);
    try {
      setSubmittedQuestion(inputValue);
  
      const response = await fetch("/api/getLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: inputValue }),
      });
  
      const contentType = response.headers.get("content-type");
      let data: EnhancedLocationData | { error: string } | null = null;
  
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        alert("Unexpected response from server.");
        setLoading(false);
        return;
      }
  
      if (data && !('error' in data)) {
        const imageUrl = await fetchLocationImage(data.title);
        setLocationData({ ...data, imageUrl });
        setActiveTab('overview');
        setSelectedFoodStreet(null);
      } else {
        alert("Could not find location data. Please try again.");
      }
      setInputValue("");
    } catch (error) {
      console.error(error);
      alert("Error connecting to API");
    }
    setLoading(false);
  };

  const handleStoreClick = (store: FoodStore) => {
    if (store.googleMapsUrl) {
      window.open(store.googleMapsUrl, '_blank');
    }
  };

  return (
    <>
      {loading && <Loader />}
      
      {/* Main Map */}
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />

      {/* Search Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[15000]">
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center space-x-2 min-w-96">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border-0 focus:outline-none text-gray-700"
            placeholder="🍜 Discover food streets in any city..."
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-md"
          >
            Explore 🔍
          </button>
        </div>
      </div>

      {/* Enhanced Sidebar */}
      {locationData && showSidebar && (
        <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl z-[15000] overflow-hidden">
          {/* Header with Image */}
          <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
            {locationData.imageUrl && (
              <Image 
                src={locationData.imageUrl} 
                alt={locationData.title}
                className="w-full h-full object-cover"
                width={384} // Width of the sidebar (w-96)
                height={192} // Height of the header (h-48)
                priority
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-2xl font-bold">{locationData.title}</h1>
              <p className="text-sm opacity-90">{locationData.country} • {locationData.currency}</p>
            </div>
            <button 
              onClick={() => setShowSidebar(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b bg-gray-50">
            {[
              { key: 'overview', label: '📍 Overview', icon: '📍' },
              { key: 'food', label: '🍜 Food Streets', icon: '🍜' },
              { key: 'restrictions', label: '⚠️ Rules', icon: '⚠️' },
              { key: 'culture', label: '🎭 Culture', icon: '🎭' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'food' | 'restrictions' | 'culture')}
                className={`flex-1 py-3 px-2 text-xs font-medium transition-all ${
                  activeTab === tab.key 
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">{tab.icon}</div>
                  <div className="mt-1">{tab.label.split(' ')[1]}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-280px)]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">📍 Location Details</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>City:</strong> {locationData.city}</p>
                    <p><strong>Country:</strong> {locationData.country}</p>
                    <p><strong>Language:</strong> {locationData.language}</p>
                    <p><strong>Currency:</strong> {locationData.currency}</p>
                    <p><strong>Coordinates:</strong> {locationData.coordinates[0]}, {locationData.coordinates[1]}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">🍽️ Food Scene Highlights</h3>
                  <p className="text-sm text-gray-600">
                    Discover {locationData.famousFoodStreets.length} famous food streets with authentic local cuisine, 
                    cultural dining experiences, and must-visit food establishments.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'food' && (
              <div className="space-y-4">
                {locationData.famousFoodStreets.map((street, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                    <div 
                      className="bg-gradient-to-r from-orange-50 to-red-50 p-4 cursor-pointer hover:from-orange-100 hover:to-red-100 transition-all"
                      onClick={() => setSelectedFoodStreet(selectedFoodStreet === index ? null : index)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{street.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{street.description}</p>
                          <p className="text-xs text-orange-600 mt-2">⏰ {street.bestTimeToVisit}</p>
                        </div>
                        <span className="text-gray-400">{selectedFoodStreet === index ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    {selectedFoodStreet === index && (
                      <div className="p-4 bg-white">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">🍽️ Popular Dishes</h4>
                          <div className="flex flex-wrap gap-2">
                            {street.popularDishes.map((dish, i) => (
                              <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                                {dish}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">🏪 Top Food Stores</h4>
                          <div className="space-y-3">
                            {street.topStores.map((store, i) => (
                              <div 
                                key={i} 
                                className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                                onClick={() => handleStoreClick(store)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800">{store.name}</h5>
                                    <p className="text-xs text-gray-600 mt-1">{store.address}</p>
                                    <p className="text-sm text-orange-600 mt-1">🍽️ {store.specialty}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      store.priceRange === 'Budget' ? 'bg-green-100 text-green-700' :
                                      store.priceRange === 'Mid-range' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {store.priceRange}
                                    </span>
                                    {store.googleMapsUrl && (
                                      <p className="text-xs text-blue-500 mt-1">📍 View on Maps</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'restrictions' && (
              <div className="space-y-3">
                {locationData.localRestrictions.map((restriction, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex items-start">
                      <div className="text-red-400 mr-3 mt-1">⚠️</div>
                      <div>
                        <h3 className="font-semibold text-red-800">{restriction.category}</h3>
                        <p className="text-sm text-red-700 mt-1">{restriction.restriction}</p>
                        <p className="text-xs text-red-600 mt-2 font-medium">💰 {restriction.penalty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'culture' && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🎭 Cultural Tips</h3>
                  <div className="space-y-3">
                    {locationData.culturalTips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <div className="text-purple-500 mr-3 mt-1">💡</div>
                        <p className="text-sm text-purple-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">🗣️ Language & Communication</h3>
                  <p className="text-sm text-indigo-700">
                    Primary language: <strong>{locationData.language}</strong>
                  </p>
                  <p className="text-xs text-indigo-600 mt-2">
                    Consider learning basic food-related phrases to enhance your dining experience!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button to reopen sidebar */}
      {locationData && !showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="absolute top-20 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 z-[15000]"
        >
          🍜
        </button>
      )}
    </>
  );
};

export default OLMapComponent;
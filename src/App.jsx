import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { MapPin, Sun, Cloud, CloudRain, CloudSnow, Wind, Umbrella } from "lucide-react";

const WeatherVisualization = ({ weatherCode }) => {
    const containerRef = useRef(null);

    const renderWeatherElements = () => {
        switch (true) {
            case weatherCode <= 1:
                return (
                    <>
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={`ray-${i}`}
                                className="absolute bg-yellow-400/50"
                                style={{
                                    width: "2px",
                                    height: `${Math.random() * 100 + 50}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    transformOrigin: "center",
                                }}
                                animate={{
                                    rotate: [0, 360],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 3,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                }}
                            />
                        ))}
                    </>
                );
            case weatherCode <= 3:
                return (
                    <>
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={`cloud-${i}`}
                                className="absolute bg-gray-200 rounded-full blur-xl"
                                style={{
                                    width: `${Math.random() * 150 + 100}px`,
                                    height: `${Math.random() * 80 + 50}px`,
                                    top: `${Math.random() * 70}%`,
                                    left: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    x: [-50, 50],
                                    opacity: [0.4, 0.7, 0.4],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 5,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                }}
                            />
                        ))}
                    </>
                );
            case weatherCode <= 21:
                return (
                    <>
                        {[...Array(100)].map((_, i) => (
                            <motion.div
                                key={`raindrop-${i}`}
                                className="absolute bg-blue-300 w-[2px] h-[20px] rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-20px`,
                                }}
                                animate={{
                                    y: window.innerHeight,
                                    x: [
                                        `${Math.random() * 50 - 25}px`,
                                        `${Math.random() * 50 - 25}px`,
                                    ],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                    duration: Math.random() * 2 + 1,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </>
                );
            case weatherCode <= 32:
                return (
                    <>
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={`snowflake-${i}`}
                                className="absolute bg-white w-[4px] h-[4px] rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-10px`,
                                }}
                                animate={{
                                    y: window.innerHeight,
                                    x: [
                                        `${Math.random() * 50 - 25}px`,
                                        `${Math.random() * 50 - 25}px`,
                                    ],
                                    rotate: [0, 360],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 3,
                                }}
                            />
                        ))}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {renderWeatherElements()}
        </motion.div>
    );
};

const App = () => {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const controls = useAnimation();

    const fetchWeather = async (city) => {
        setLoading(true);
        setError("");

        try {
            const coordResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?city=${city}&format=json`
            );
            const coordData = await coordResponse.json();

            if (!coordData.length) throw new Error("City not found");

            const { lat, lon, display_name } = coordData[0];

            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m,precipitation_probability`
            );
            const weatherData = await weatherResponse.json();

            const currentWeather = weatherData.current_weather;
            const hourlyData = weatherData.hourly;

            const currentHourIndex = new Date().getHours();

            setWeatherData({
                location: display_name,
                temperature: currentWeather.temperature,
                weatherCode: currentWeather.weathercode,
                windSpeed: currentWeather.windspeed,
                precipitationProbability: hourlyData.precipitation_probability[currentHourIndex],
                hourlyTemperatures: hourlyData.temperature_2m.slice(
                    currentHourIndex,
                    currentHourIndex + 6
                ),
            });

            controls.start({
                scale: [0.9, 1],
                opacity: [0, 1],
                transition: { type: "spring", stiffness: 300, damping: 20 },
            });
        } catch (err) {
            setError(err.message);
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherDescription = (weatherCode) => {
        switch (true) {
            case weatherCode <= 1:
                return "Clear Skies";
            case weatherCode <= 3:
                return "Partly Cloudy";
            case weatherCode <= 21:
                return "Rainy";
            case weatherCode <= 32:
                return "Snowy";
            default:
                return "Mixed Conditions";
        }
    };

    const getWeatherIcon = (weatherCode) => {
        if (weatherCode <= 1) return <Sun className="text-yellow-500" size={96} />;
        if (weatherCode <= 3) return <Cloud className="text-gray-400" size={96} />;
        if (weatherCode <= 21) return <CloudRain className="text-blue-500" size={96} />;
        if (weatherCode <= 32) return <CloudSnow className="text-white" size={96} />;
        return <Cloud className="text-gray-400" size={96} />;
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4 overflow-hidden">
            {weatherData && (
                <WeatherVisualization
                    weatherCode={weatherData.weatherCode}
                    temperature={weatherData.temperature}
                />
            )}

            <motion.div
                className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        fetchWeather(city);
                    }}
                    className="mb-6"
                >
                    <motion.input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-indigo-500 text-white py-3 rounded-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Searching..." : "Get Weather"}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {weatherData && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="text-center"
                        >
                            <motion.div
                                className="flex justify-center mb-4"
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {getWeatherIcon(weatherData.weatherCode)}
                            </motion.div>

                            <motion.div
                                className="flex items-center justify-center mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <MapPin className="mr-2 text-indigo-500" />
                                <h2 className="text-xl font-semibold">{weatherData.location}</h2>
                            </motion.div>

                            <motion.p
                                className="text-6xl font-light mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {weatherData.temperature}°C
                            </motion.p>

                            <motion.p
                                className="text-xl font-medium text-gray-600 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                {getWeatherDescription(weatherData.weatherCode)}
                            </motion.p>

                            <motion.div
                                className="flex justify-around mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="flex items-center">
                                    <Wind className="mr-2 text-blue-500" />
                                    <span>{weatherData.windSpeed} km/h</span>
                                </div>
                                <div className="flex items-center">
                                    <Umbrella className="mr-2 text-indigo-500" />
                                    <span>{weatherData.precipitationProbability}%</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-4"
                    >
                        {error}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default App;

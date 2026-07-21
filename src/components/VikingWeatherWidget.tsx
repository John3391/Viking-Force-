import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Wind, 
  Droplets, 
  MapPin, 
  Search, 
  RefreshCw, 
  Compass, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Thermometer,
  Snowflake,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface WeatherInfo {
  city: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    apparentTemperature: number;
    precipitationProbability: number;
    weatherCode: number;
  }>;
  daily: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    weatherCode: number;
  }>;
}

interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

interface WeatherCodeInfo {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  score: 'excellent' | 'good' | 'fair' | 'poor';
}

function getWeatherInfo(code: number): WeatherCodeInfo {
  switch (code) {
    case 0:
      return { 
        text: 'Céu Limpo', 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-950/20', 
        borderColor: 'border-amber-500/20',
        score: 'excellent' 
      };
    case 1:
    case 2:
    case 3:
      return { 
        text: 'Parcialmente Nublado', 
        color: 'text-viking-silver', 
        bgColor: 'bg-[#1a1210]/60', 
        borderColor: 'border-viking-gold/15',
        score: 'good' 
      };
    case 45:
    case 48:
      return { 
        text: 'Nevoeiro', 
        color: 'text-slate-400', 
        bgColor: 'bg-slate-950/20', 
        borderColor: 'border-slate-500/20',
        score: 'fair' 
      };
    case 51:
    case 53:
    case 55:
      return { 
        text: 'Chuvisco', 
        color: 'text-sky-300', 
        bgColor: 'bg-sky-950/20', 
        borderColor: 'border-sky-500/20',
        score: 'fair' 
      };
    case 56:
    case 57:
      return { 
        text: 'Chuvisco Gelante', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-950/25', 
        borderColor: 'border-blue-500/20',
        score: 'poor' 
      };
    case 61:
    case 63:
    case 65:
      return { 
        text: 'Chuva', 
        color: 'text-sky-400', 
        bgColor: 'bg-sky-950/30', 
        borderColor: 'border-sky-500/35',
        score: 'poor' 
      };
    case 66:
    case 67:
      return { 
        text: 'Chuva Gelante', 
        color: 'text-indigo-400', 
        bgColor: 'bg-indigo-950/30', 
        borderColor: 'border-indigo-500/20',
        score: 'poor' 
      };
    case 71:
    case 73:
    case 75:
      return { 
        text: 'Neve', 
        color: 'text-blue-100', 
        bgColor: 'bg-blue-950/10', 
        borderColor: 'border-blue-100/10',
        score: 'poor' 
      };
    case 77:
      return { 
        text: 'Granizo', 
        color: 'text-blue-200', 
        bgColor: 'bg-blue-950/20', 
        borderColor: 'border-blue-300/20',
        score: 'poor' 
      };
    case 80:
    case 81:
    case 82:
      return { 
        text: 'Pancadas de Chuva', 
        color: 'text-sky-400', 
        bgColor: 'bg-sky-950/40', 
        borderColor: 'border-sky-500/40',
        score: 'poor' 
      };
    case 85:
    case 86:
      return { 
        text: 'Pancadas de Neve', 
        color: 'text-blue-200', 
        bgColor: 'bg-blue-950/20', 
        borderColor: 'border-blue-200/20',
        score: 'poor' 
      };
    case 95:
      return { 
        text: 'Tempestade', 
        color: 'text-red-400', 
        bgColor: 'bg-red-950/20', 
        borderColor: 'border-red-500/30',
        score: 'poor' 
      };
    case 96:
    case 99:
      return { 
        text: 'Tempestade Forte', 
        color: 'text-red-500', 
        bgColor: 'bg-red-950/40', 
        borderColor: 'border-red-500/50',
        score: 'poor' 
      };
    default:
      return { 
        text: 'Clima Firme', 
        color: 'text-viking-silver', 
        bgColor: 'bg-[#1a1210]/60', 
        borderColor: 'border-viking-gold/15',
        score: 'good' 
      };
  }
}

function getWeatherIcon(code: number, className = "w-5 h-5") {
  switch (code) {
    case 0:
      return <Sun className={`${className} text-amber-400`} />;
    case 1:
    case 2:
      return <CloudSun className={`${className} text-amber-300/90`} />;
    case 3:
      return <Cloud className={`${className} text-slate-400`} />;
    case 45:
    case 48:
      return <CloudFog className={`${className} text-slate-400/80`} />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className={`${className} text-sky-300`} />;
    case 56:
    case 57:
    case 66:
    case 67:
      return <CloudSnow className={`${className} text-blue-300`} />;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain className={`${className} text-sky-400`} />;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return <Snowflake className={`${className} text-blue-200`} />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning className={`${className} text-red-400`} />;
    default:
      return <Cloud className={`${className} text-viking-silver`} />;
  }
}

function getOutdoorRecommendation(temp: number, precipProb: number, code: number) {
  const info = getWeatherInfo(code);
  
  if (info.score === 'poor' || precipProb >= 40) {
    return {
      text: 'Evite Treino Externo',
      desc: 'Risco alto de chuva ou tempestade. Treine no salão coberto para honrar Odin com segurança.',
      color: 'text-red-400 border-red-500/20 bg-red-950/15',
      badge: '🔴 NÃO RECOMENDADO',
      tag: 'Salão Interno'
    };
  }
  
  if (temp > 33) {
    return {
      text: 'Calor Extremo',
      desc: 'Sol escaldante de verão. Se for treinar na rua, prefira as sombras e triplique a hidratação!',
      color: 'text-amber-500 border-amber-500/20 bg-amber-950/10',
      badge: '🟡 CUIDADO / MUITO QUENTE',
      tag: 'Prefira Sombras'
    };
  }
  
  if (temp < 10) {
    return {
      text: 'Frio Extremo',
      desc: 'Frio congelante digno de Niflheim. Aqueça as articulações com rigor antes de erguer o aço ao ar livre.',
      color: 'text-blue-400 border-blue-500/20 bg-blue-950/15',
      badge: '🟡 VISTA AGASALHO',
      tag: 'Articulações Frias'
    };
  }
  
  if (precipProb >= 15) {
    return {
      text: 'Clima Instável',
      desc: 'Tempo incerto com pequena probabilidade de garoa. Tenha um abrigo próximo para não interromper a série.',
      color: 'text-yellow-400 border-yellow-500/20 bg-yellow-950/10',
      badge: '🟡 ALERTA INSTÁVEL',
      tag: 'Leve Capa/Abrigo'
    };
  }

  if (temp >= 16 && temp <= 26) {
    return {
      text: 'Clima Lendário!',
      desc: 'Temperatura perfeita e tempo seco. Dia perfeito para arremessar pedras, correr ou fazer calistenia!',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/15',
      badge: '🟢 EXCELENTE PARA TREINO',
      tag: 'Clima Perfeito'
    };
  }

  return {
    text: 'Condições Favoráveis',
    desc: 'O tempo está firme e cooperando. Um ótimo dia para encarar o vento e treinar como um verdadeiro nórdico!',
    color: 'text-[#e0d3a8] border-viking-gold/20 bg-viking-gold/5',
    badge: '🟢 RECOMENDADO',
    tag: 'Clima Bom'
  };
}

export function VikingWeatherWidget() {
  const [cityInput, setCityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodeResult[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'hourly' | 'daily'>('current');
  const [showSearch, setShowSearch] = useState(false);

  // Initialize with a default city or cached coords
  useEffect(() => {
    const cachedWeather = localStorage.getItem('viking_weather_cached');
    if (cachedWeather) {
      try {
        setWeatherData(JSON.parse(cachedWeather));
      } catch (_) {
        // ignore fallback
      }
    }
    
    // Fetch default location (e.g. Porto Alegre, or detect)
    const savedLat = localStorage.getItem('viking_weather_lat');
    const savedLon = localStorage.getItem('viking_weather_lon');
    const savedCity = localStorage.getItem('viking_weather_city') || 'Porto Alegre';

    if (savedLat && savedLon) {
      fetchForecast(parseFloat(savedLat), parseFloat(savedLon), savedCity);
    } else {
      // Fetch default Porto Alegre coordinates
      fetchForecast(-30.0346, -51.2177, 'Porto Alegre');
    }
  }, []);

  const fetchForecast = async (lat: number, lon: number, cityName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        throw new Error('Falha ao obter os dados climáticos.');
      }
      const data = await response.json();
      setWeatherData(data);
      localStorage.setItem('viking_weather_cached', JSON.stringify(data));
      localStorage.setItem('viking_weather_lat', String(lat));
      localStorage.setItem('viking_weather_lon', String(lon));
      localStorage.setItem('viking_weather_city', cityName);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cityInput.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/weather/search?q=${encodeURIComponent(cityInput.trim())}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar coordenadas da cidade.');
      }
      const suggestions: GeocodeResult[] = await response.json();
      if (suggestions.length === 0) {
        setErrorMsg('Nenhuma cidade encontrada com esse nome.');
        setSearchSuggestions([]);
      } else if (suggestions.length === 1) {
        const first = suggestions[0];
        const fullName = `${first.name}${first.admin1 ? `, ${first.admin1}` : ''} (${first.country})`;
        await fetchForecast(first.latitude, first.longitude, fullName);
        setSearchSuggestions([]);
        setCityInput('');
        setShowSearch(false);
      } else {
        setSearchSuggestions(suggestions);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro na busca de geolocalização.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchForecast(latitude, longitude, 'Localização Atual');
        setShowSearch(false);
      },
      (err) => {
        let errMsg = 'Permissão de localização negada.';
        if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Localização indisponível.';
        if (err.code === err.TIMEOUT) errMsg = 'Tempo limite de localização esgotado.';
        setErrorMsg(errMsg);
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSuggestionSelect = (city: GeocodeResult) => {
    const fullName = `${city.name}${city.admin1 ? `, ${city.admin1}` : ''} (${city.country})`;
    fetchForecast(city.latitude, city.longitude, fullName);
    setSearchSuggestions([]);
    setCityInput('');
    setShowSearch(false);
  };

  const currentInfo = weatherData ? getWeatherInfo(weatherData.current.weatherCode) : null;
  const currentRecommendation = weatherData 
    ? getOutdoorRecommendation(weatherData.current.temp, weatherData.hourly[0]?.precipitationProbability || 0, weatherData.current.weatherCode)
    : null;

  return (
    <div id="viking-weather-widget" className="bg-[#1a1210]/85 border border-viking-gold/20 p-5 rounded-3xl backdrop-blur-md shadow-xl text-left relative overflow-hidden">
      <div className="absolute right-4 top-4 text-viking-gold/5 pointer-events-none">
        <Compass className="w-24 h-24 rotate-45 animate-spin-slow" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-viking-gold/15 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-viking-gold/10 text-viking-gold">
            <Compass className="w-4 h-4 text-viking-gold animate-pulse-gold" />
          </div>
          <div>
            <h3 className="font-viking-display text-xs font-black tracking-widest text-viking-gold uppercase">Runa do Clima</h3>
            <p className="text-[9px] text-viking-silver/60 uppercase font-bold">Treinos ao Ar Livre</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className="p-1.5 rounded-lg bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/15 text-viking-silver hover:text-viking-gold transition-colors cursor-pointer"
            title="Mudar Cidade"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => {
              if (weatherData) {
                const lat = localStorage.getItem('viking_weather_lat');
                const lon = localStorage.getItem('viking_weather_lon');
                const city = localStorage.getItem('viking_weather_city') || 'Porto Alegre';
                if (lat && lon) fetchForecast(parseFloat(lat), parseFloat(lon), city);
              }
            }} 
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/15 text-viking-silver hover:text-viking-gold transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar Clima"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input Block */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden space-y-2.5 relative z-10"
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar Cidade (Ex: Gramado, SP)"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3 py-2 pl-8 text-xs rounded-xl bg-black/60 border border-viking-gold/25 text-viking-silver focus:outline-none focus:border-viking-gold focus:ring-1 focus:ring-viking-gold"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-viking-silver/50" />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-viking-gold hover:bg-viking-gold-dark text-viking-dark font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Buscar
              </button>
              <button 
                type="button" 
                onClick={handleDetectLocation}
                disabled={isLoading}
                className="p-2 rounded-xl bg-viking-dark hover:bg-viking-gold/10 border border-viking-gold/20 text-viking-gold transition-colors cursor-pointer disabled:opacity-50"
                title="Detectar por GPS"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="bg-black/80 border border-viking-gold/20 rounded-xl p-1.5 max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                <p className="text-[9px] text-viking-silver/50 uppercase font-black px-2 py-1">Selecione uma Cidade:</p>
                {searchSuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionSelect(city)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-viking-gold/10 text-xs text-viking-silver hover:text-viking-gold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{city.name}{city.admin1 ? `, ${city.admin1}` : ''}</span>
                    <span className="text-[10px] opacity-65 uppercase font-mono">{city.country}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error block */}
      {errorMsg && (
        <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-start gap-2 mb-4 relative z-10 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content */}
      {weatherData ? (
        <div className="space-y-4 relative z-10">
          
          {/* Header City & Core Temp */}
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-viking-gold shrink-0" />
                {weatherData.city}
              </p>
              <p className="text-[11px] text-viking-silver/80 mt-0.5">{currentInfo?.text}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white font-mono leading-none tracking-tight">
                {Math.round(weatherData.current.temp)}°C
              </p>
              <p className="text-[9px] text-viking-silver/50 font-semibold mt-0.5 uppercase">Sensação {Math.round(weatherData.current.feelsLike)}°C</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 py-2 bg-black/25 rounded-xl border border-viking-gold/5 text-center">
            <div className="space-y-0.5">
              <span className="text-[9px] text-viking-silver/40 uppercase block font-semibold">Vento</span>
              <span className="text-xs text-white font-bold font-mono flex items-center justify-center gap-0.5">
                <Wind className="w-3 h-3 text-viking-silver" />
                {Math.round(weatherData.current.windSpeed)} km/h
              </span>
            </div>
            <div className="space-y-0.5 border-x border-viking-gold/5">
              <span className="text-[9px] text-viking-silver/40 uppercase block font-semibold">Humidade</span>
              <span className="text-xs text-white font-bold font-mono flex items-center justify-center gap-0.5">
                <Droplets className="w-3 h-3 text-sky-400" />
                {weatherData.current.humidity}%
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-viking-silver/40 uppercase block font-semibold">Precipitação</span>
              <span className="text-xs text-white font-bold font-mono flex items-center justify-center gap-0.5">
                <CloudRain className="w-3 h-3 text-sky-400" />
                {weatherData.current.precipitation} mm
              </span>
            </div>
          </div>

          {/* RECOMMENDATION BLOCK */}
          {currentRecommendation && (
            <div className={`p-3.5 rounded-2xl border-2 leading-relaxed transition-all ${currentRecommendation.color}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  Análise de Clima
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e0d3a8]">
                  {currentRecommendation.tag}
                </span>
              </div>
              <h4 className="font-viking-display text-xs font-black tracking-wider flex items-center gap-1 text-white">
                <Flame className="w-3.5 h-3.5 text-viking-gold animate-pulse" />
                {currentRecommendation.text}
              </h4>
              <p className="text-[11px] opacity-85 mt-1">
                {currentRecommendation.desc}
              </p>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-viking-gold/10 gap-1 mt-4">
            <button 
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'current' ? 'text-viking-gold border-viking-gold bg-viking-gold/5' : 'text-viking-silver/60 border-transparent hover:text-viking-silver'}`}
            >
              Agora
            </button>
            <button 
              onClick={() => setActiveTab('hourly')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'hourly' ? 'text-viking-gold border-viking-gold bg-viking-gold/5' : 'text-viking-silver/60 border-transparent hover:text-viking-silver'}`}
            >
              Horários
            </button>
            <button 
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'daily' ? 'text-viking-gold border-viking-gold bg-viking-gold/5' : 'text-viking-silver/60 border-transparent hover:text-viking-silver'}`}
            >
              Próximos Dias
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'current' && (
            <div className="text-[11px] text-viking-silver bg-black/15 p-3 rounded-2xl border border-viking-gold/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-viking-gold font-bold">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>O Vento Sopra Claras Instruções:</span>
              </div>
              <p className="leading-normal italic">
                {weatherData.current.temp > 28 
                  ? "As divindades do sol aquecem as terras do norte. Se for correr ou treinar arremessos ao ar livre, garanta que seu berrante de água esteja repleto." 
                  : weatherData.current.temp < 15 
                  ? "O sopro gelado de Jötunheim requer um aquecimento corporal robusto. Agasalhe-se e proteja suas articulações antes de erguer o ferro exterior."
                  : "As valquírias consideram este clima perfeito para batalhar com o ferro ao ar livre. Não perca a oportunidade de treinar fora hoje!"}
              </p>
            </div>
          )}

          {activeTab === 'hourly' && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              <p className="text-[9px] text-viking-silver/40 uppercase font-black tracking-wider pb-1 flex items-center justify-between">
                <span>Previsão para as Próximas Horas</span>
                <span className="text-viking-gold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Outdoor</span>
              </p>
              {weatherData.hourly.map((h, hIdx) => {
                const hourRecommendation = getOutdoorRecommendation(h.temp, h.precipitationProbability, h.weatherCode);
                const isExcellent = hourRecommendation.badge.includes('EXCELENTE');
                const isAvoid = hourRecommendation.badge.includes('NÃO RECOMENDADO');
                const badgeColor = isExcellent ? 'text-emerald-400 bg-emerald-950/10' : isAvoid ? 'text-red-400 bg-red-950/10' : 'text-yellow-400 bg-yellow-950/10';

                return (
                  <div key={hIdx} className="flex items-center justify-between bg-[#140e0c] rounded-xl p-2 border border-viking-gold/5 hover:border-viking-gold/15 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white min-w-[40px]">{h.time}</span>
                      {getWeatherIcon(h.weatherCode, "w-4 h-4")}
                      <span className="text-xs font-bold text-white font-mono">{Math.round(h.temp)}°C</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {h.precipitationProbability > 0 && (
                        <span className="text-[9px] font-mono font-bold text-sky-400 flex items-center gap-0.5 bg-sky-950/20 px-1 rounded">
                          🌧️ {h.precipitationProbability}%
                        </span>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${badgeColor}`}>
                        {isExcellent ? 'Perfeito' : isAvoid ? 'Evitar' : 'Bom'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-1.5">
              <p className="text-[9px] text-viking-silver/40 uppercase font-black tracking-wider pb-1">Previsão Semanal</p>
              {weatherData.daily.map((d, dIdx) => (
                <div key={dIdx} className="flex items-center justify-between bg-[#140e0c] rounded-xl p-2 border border-viking-gold/5 hover:border-viking-gold/15 transition-all">
                  <span className="text-xs font-bold text-white uppercase w-10 text-left">{d.day}</span>
                  <div className="flex items-center gap-1.5">
                    {getWeatherIcon(d.weatherCode, "w-4 h-4")}
                    <span className="text-[10px] text-viking-silver/70 truncate max-w-[100px]">
                      {getWeatherInfo(d.weatherCode).text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.precipitationSum > 0 && (
                      <span className="text-[9px] font-mono font-bold text-sky-400" title="Precipitação esperada">
                        {d.precipitationSum.toFixed(1)}mm
                      </span>
                    )}
                    <span className="text-xs font-bold font-mono text-white">
                      <span className="text-amber-400">{Math.round(d.tempMax)}°</span>
                      <span className="text-viking-silver/40 mx-0.5">/</span>
                      <span className="text-blue-400">{Math.round(d.tempMin)}°</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <RefreshCw className="w-8 h-8 text-viking-gold animate-spin" />
          <p className="text-xs text-viking-silver/60 uppercase tracking-widest font-bold">Consultando os deuses do clima...</p>
        </div>
      )}
    </div>
  );
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Weather geocoding search route
  app.get("/api/weather/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Parâmetro 'q' (nome da cidade) é obrigatório." });
      }
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=pt&format=json`;
      const response = await fetch(geocodeUrl);
      if (!response.ok) {
        throw new Error(`Erro na busca da cidade: ${response.statusText}`);
      }
      const data = await response.json();
      res.json(data.results || []);
    } catch (error: any) {
      console.error("[Server Weather] Error searching city:", error);
      res.status(500).json({ error: error.message || "Erro interno ao buscar cidade." });
    }
  });

  // Weather forecast route
  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { lat, lon, city } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Parâmetros 'lat' e 'lon' são obrigatórios." });
      }

      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const response = await fetch(forecastUrl);
      if (!response.ok) {
        throw new Error(`Erro ao obter previsão do tempo: ${response.statusText}`);
      }
      const data = await response.json();

      // Process and format data nicely for the client
      const current = data.current;
      const hourly = data.hourly;
      const daily = data.daily;

      // Map hourly (next 12 hours)
      const now = new Date();
      let currentHourIdx = 0;
      if (hourly && hourly.time) {
        const found = hourly.time.findIndex((t: string) => {
          const d = new Date(t);
          return d.getTime() >= now.getTime() - 1800000; // within 30 mins
        });
        if (found !== -1) currentHourIdx = found;
      }

      const formattedHourly = [];
      if (hourly && hourly.time) {
        const startIdx = Math.max(0, currentHourIdx);
        for (let i = startIdx; i < Math.min(hourly.time.length, startIdx + 12); i++) {
          const timeVal = new Date(hourly.time[i]);
          const formattedTime = timeVal.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const temp = hourly.temperature_2m[i];
          const appTemp = hourly.apparent_temperature ? hourly.apparent_temperature[i] : temp;
          const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
          const code = hourly.weather_code[i];

          formattedHourly.push({
            time: formattedTime,
            temp,
            apparentTemperature: appTemp,
            precipitationProbability: precipProb,
            weatherCode: code,
          });
        }
      }

      // Map daily (next 5 days)
      const formattedDaily = [];
      if (daily && daily.time) {
        for (let i = 0; i < Math.min(daily.time.length, 5); i++) {
          const dateVal = new Date(daily.time[i] + 'T00:00:00');
          const formattedDay = dateVal.toLocaleDateString("pt-BR", { weekday: "short" });
          const tempMax = daily.temperature_2m_max[i];
          const tempMin = daily.temperature_2m_min[i];
          const precipSum = daily.precipitation_sum ? daily.precipitation_sum[i] : 0;
          const code = daily.weather_code[i];

          formattedDaily.push({
            day: formattedDay.replace(".", ""), // remove dot if any
            tempMax,
            tempMin,
            precipitationSum: precipSum,
            weatherCode: code,
          });
        }
      }

      res.json({
        city: city || "Local Detectado",
        current: {
          temp: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          precipitation: current.precipitation,
          weatherCode: current.weather_code,
        },
        hourly: formattedHourly,
        daily: formattedDaily,
      });
    } catch (error: any) {
      console.error("[Server Weather] Error fetching forecast:", error);
      res.status(500).json({ error: error.message || "Erro interno ao obter previsão do tempo." });
    }
  });

  // Calendar route placeholder
  app.post("/api/calendar/add-event", async (req, res) => {
    // This will be implemented in a future step
    res.json({ status: "not_implemented" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

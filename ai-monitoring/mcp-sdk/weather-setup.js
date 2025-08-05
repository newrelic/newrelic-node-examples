
const { z } = require("zod");
const fs = require("fs").promises;
const path = require("path");

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

function registerWeatherTools(server) {
    // Register weather tools
    server.tool(
        "get_alerts",
        "Get weather alerts for a state",
        {
            state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
        },
        async ({ state }) => {
            const stateCode = state.toUpperCase();
            const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
            const alertsData = await makeNWSRequest(alertsUrl);

            if (!alertsData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve alerts data",
                        },
                    ],
                };
            }

            const features = alertsData.features || [];
            if (features.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No active alerts for ${stateCode}`,
                        },
                    ],
                };
            }

            const formattedAlerts = features.map(formatAlert);
            const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

            return {
                content: [
                    {
                        type: "text",
                        text: alertsText,
                    },
                ],
            };
        },
    );

    server.tool(
        "get_forecast",
        "Get weather forecast for a location",
        {
            latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
            longitude: z
                .number()
                .min(-180)
                .max(180)
                .describe("Longitude of the location"),
        },
        async ({ latitude, longitude }) => {
            // Get grid point data
            const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
            const pointsData = await makeNWSRequest(pointsUrl);

            if (!pointsData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
                        },
                    ],
                };
            }

            const forecastUrl = pointsData.properties?.forecast;
            if (!forecastUrl) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to get forecast URL from grid point data",
                        },
                    ],
                };
            }

            // Get forecast data
            const forecastData = await makeNWSRequest(forecastUrl);
            if (!forecastData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve forecast data",
                        },
                    ],
                };
            }

            const periods = forecastData.properties?.periods || [];
            if (periods.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No forecast periods available",
                        },
                    ],
                };
            }

            // Format forecast periods
            const formattedForecast = periods.map((period) =>
                [
                    `${period.name || "Unknown"}:`,
                    `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
                    `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
                    `${period.shortForecast || "No forecast available"}`,
                    "---",
                ].join("\n"),
            );

            const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

            return {
                content: [
                    {
                        type: "text",
                        text: forecastText,
                    },
                ],
            };
        },
    );
}

// Helper function for making NWS API requests
async function makeNWSRequest(url) {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/geo+json",
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    } catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}

// Format alert data
function formatAlert(feature) {
    const props = feature.properties;
    return [
        `Event: ${props.event || "Unknown"}`,
        `Area: ${props.areaDesc || "Unknown"}`,
        `Severity: ${props.severity || "Unknown"}`,
        `Status: ${props.status || "Unknown"}`,
        `Headline: ${props.headline || "No headline"}`,
        "---",
    ].join("\n");
}

function registerWeatherResources(server) {
    server.resource(
        "weather_tips", // The name of the resource, matching the capability defined above
        async () => {
            // In a real application, you might read this from a database or external API.
            // For this example, let's read it from a simple text file.
            const filePath = path.join(process.cwd(), 'weather_tips.txt'); // Assuming weather_tips.txt is in the same directory
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                return {
                    content: [
                        {
                            type: "text",
                            text: content,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error reading weather_tips.txt:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Could not retrieve weather safety tips.",
                        },
                    ],
                };
            }
        },
    );
}

function registerWeatherPrompts(server) {
    server.prompt(
        "summarize_forecast", // The name of the prompt, matching the capability defined above
        async () => {
            const promptTemplate = `
      Please summarize the following weather forecast in a concise and easy-to-understand manner. Highlight key information such as temperature, wind, and any notable conditions.

      Forecast: {{forecast_data}}
      `;
            return {
                content: [
                    {
                        type: "text",
                        text: promptTemplate,
                    },
                ],
            };
        },
    );
}

module.exports = {
    registerWeatherTools,
    registerWeatherResources,
    registerWeatherPrompts
};
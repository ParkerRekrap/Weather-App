
const API_KEY = 'e6932e7e1dda0d4431f585a7a6f59a39';
const api_Url="https://api.openweathermap.org/data/2.5/weather?&units=metric"

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const cityName = document.getElementById('city-name');
const weatherDesc = document.getElementById('weather-desc');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const weatherInfo = document.getElementById('weather-info');

// Add event listeners
searchButton.addEventListener('click', getWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Function to get current weather
function getWeather() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    hideError();
    
    // Make API call to OpenWeatherMap
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            getWeatherForecast(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showError('City not found. Please check spelling and try again.');
            hideLoading();
        });
}
function getWeatherForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
            hideLoading();
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            hideLoading();
        });
}
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDesc.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${(data.wind.speed).toFixed(1)} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    updateBackground(data.main.temp);
    
    weatherInfo.style.display = 'block';
}
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    const dailyData = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
      
        if (new Date().getDate() === date.getDate()) {
            return;
        }
        
     
        if (!dailyData[day]) {
            dailyData[day] = {
                date: day,
                temps: [],
                icons: [],
                descriptions: []
            };
        }
        
        dailyData[day].temps.push(item.main.temp);
        dailyData[day].icons.push(item.weather[0].icon);
        dailyData[day].descriptions.push(item.weather[0].description);
    });
 
    const uniqueDays = Object.keys(dailyData).slice(0, 5);
    
    uniqueDays.forEach(day => {
        const dayData = dailyData[day];

        const maxTemp = Math.max(...dayData.temps);
        const minTemp = Math.min(...dayData.temps);

        const mostFrequentIcon = getMostFrequent(dayData.icons);
        const mostFrequentDesc = getMostFrequent(dayData.descriptions);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';
        
        dayElement.innerHTML = `
            <div class="forecast-date">${dayData.date}</div>
            <img src="https://openweathermap.org/img/wn/${mostFrequentIcon}.png" alt="Weather icon">
            <div class="forecast-temp">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
            <div class="forecast-desc">${mostFrequentDesc.charAt(0).toUpperCase() + mostFrequentDesc.slice(1)}</div>
        `;
        
        forecastContainer.appendChild(dayElement);
    });
}

function getMostFrequent(arr) {
    const hashmap = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b);
}

function updateBackground(temp) {
    const body = document.body;
    
    if (temp < 0) {
 
        body.style.background = 'linear-gradient(135deg, #a1c4fd, #c2e9fb)';
    } else if (temp < 10) {
  
        body.style.background = 'linear-gradient(135deg, #89f7fe, #66a6ff)';
    } else if (temp < 20) {
   
        body.style.background = 'linear-gradient(135deg, #00b4db, #0083b0)';
    } else if (temp < 30) {
    
        body.style.background = 'linear-gradient(135deg, #f6d365, #fda085)';
    } else {
     
        body.style.background = 'linear-gradient(135deg, #ff7e5f, #feb47b)';
    }
}

function showLoading() {
    loading.style.display = 'block';
    weatherInfo.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

function hideError() {
    errorMessage.style.display = 'none';
}


window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
               
                getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            () => {
            
                searchInput.value = 'London';
                getWeather();
            }
        );
    } else {
        searchInput.value = 'London';
        getWeather();
    }
});
function getWeatherByCoordinates(lat, lon) {
    showLoading();
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            searchInput.value = data.name;
            displayWeather(data);
            getWeatherForecast(data.name);
        })
        .catch(error => {
            console.error('Error fetching weather by coordinates:', error);
            hideLoading();
            searchInput.value = 'London';
            getWeather();
        });
}
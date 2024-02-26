const request = require('request');

const nextISSTimesForMyLocation = function(callback) {
  const fetchMyIP = function(callback) {
    const url = 'https://api.ipify.org?format=json';
  
    request(url, (error, response, body) => {
      if (error) {
        callback(error, null);
        return;
      }
  
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }
      const ip = JSON.parse(body).ip;
  
      callback(null, ip);
    });
  };

  const fetchCoordsByIP = function(ip, callback) {
  
    request(`http://ipwho.is/${ip}`, (error, response, body) => {
      if (error) {
        callback(error, null);
        return;
      }
  
      const data = JSON.parse(body);
  
      if (!data.success) {
        const msg = `Success status ${data.success} when getting info from ip: ${data.ip}. Server message says: ${data.message}.`;
        callback(Error(msg), null);
        return;
      }
      const latAndLong = {
        latitude: data.latitude,
        longitude: data.longitude
      };
    
      callback(null, latAndLong);
    });
  };

  const fetchISSFlyOverTimes = function(coords, callback) {
    request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = (`Status code ${response.statusCode} when retrieving ISS pass times: ${body}`);
      callback(Error(msg), null);
      return;
    }
    const parsedBody = JSON.parse(body).response;
    
    callback(null, parsedBody);
    }
  )};

  fetchMyIP((error, ip) => {
    if (error) {
      callback(error, null);
      return;
    }
  
  fetchCoordsByIP(ip, (error, coords) => {
    if (error) {
      callback(error, null);
      return;
    }
    
    fetchISSFlyOverTimes(coords, (error, flyOverTimes) => {
      if (error) {
        callback(error, null);
          return;
      }
      
      callback(null, flyOverTimes);
      });
    });
  });
      
};

module.exports = { nextISSTimesForMyLocation };
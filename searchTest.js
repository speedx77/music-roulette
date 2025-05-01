async function fetchCookies(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const cookies = response.headers.getSetCookie();
      return cookies;
    } catch (error) {
      console.error("Error fetching cookies:", error);
      return [];
    }
  }
  
  // Example usage:
  fetchCookies('https://open.spotify.com/search/jean/users')
    .then(cookies => {
      console.log(cookies);
    });


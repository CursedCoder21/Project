const input = document.getElementById('device-input');
const button = document.getElementById('check-button');
const result = document.getElementById('result');

let cache = {}; // In-memory cache to store device exposure levels

const showLoadingIndicator = () => {
    // Removed loading indicator code
};

const hideLoadingIndicator = () => {
    // Removed loading indicator code
};

const determineExposureLevel = async (device) => {
    // Check if the exposure level is cached
    const cachedData = cache[device];
    if (cachedData && Date.now() - cachedData.timestamp < 60 * 60 * 1000) { // Use a cache timeout of 1 hour
        return cachedData.exposureLevel;
    }

    showLoadingIndicator();

    try {
        // Fetch the Shodan API response
        const response = await fetch(`https://api.shodan.io/shodan/host/${device}?key=OUPG97k2XFD2NolXbvt70gtoPORVmacT`);
        if (!response.ok) {
            hideLoadingIndicator();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseBody = await response.text();
        const data = JSON.parse(responseBody);

        // Calculate the exposure level based on the Shodan data
        const exposureLevel = calculateExposureLevel(data);

        // Update the cache with the latest exposure level
        cache[device] = {
            timestamp: Date.now(),
            exposureLevel,
        };

        hideLoadingIndicator();

        // Pass the shodanData object to updateResultText
        updateResultText('Your device is exposed to the internet and may be vulnerable to attacks.', data);

        return exposureLevel;
    } catch (error) {
        console.error('Error in determineExposureLevel:', error);
        throw error;
    }
};

const calculateExposureLevel = (data) => {
    try {
        if (!data || !Array.isArray(data.data)) {
            throw new Error('Invalid response format from Shodan API');
        }

        const firstEntry = data.data[0]; // Assuming we want to consider the first entry

        if (!firstEntry) {
            throw new Error('Invalid response format from Shodan API');
        }

        const ports = firstEntry.ports || []; // Handle cases where ports property is missing or empty
        const vulnerabilities = firstEntry.vulns || []; // Handle cases where vulns property is missing or empty

        // Check if specific ports are open
        const hasOpenPorts = ports.includes(22) || ports.includes(80);

        // Check if there are vulnerabilities
        const hasVulnerabilities = vulnerabilities.length > 0;

        // Determine exposure level
        if (hasOpenPorts && hasVulnerabilities) {
            return 'exposed';
        } else if (hasOpenPorts || hasVulnerabilities) {
            return 'potentially-exposed';
        } else {
            return 'safe';
        }
    } catch (error) {
        console.error('Error in calculateExposureLevel:', error);
        throw error;
    }
};

const updateResultText = (text, shodanData) => { // Add shodanData as an argument
    // Introduce a delay before updating the text content
    setTimeout(() => {
        let resultText = text;
        if (shodanData) { // Check if shodanData is defined
            // Extract relevant information from Shodan data
            const { ip, city, country_name: country, ports = [], vulns = [] } = shodanData;

            // Format the information into a user-friendly message
            const additionalInfo = `
                IP Address: ${ip}
                City: ${city}
                Country: ${country}
                Open Ports: ${ports.join(', ')}
                Vulnerabilities: ${vulns.length}
            `;

            resultText += additionalInfo;
        }

        result.textContent = resultText;
    }, 100);
};

button.addEventListener('click', async () => {
    result.textContent = 'Checking...';

    const device = input.value.trim();

    if (!device) {
        result.textContent = 'Please enter a valid IP or hostname.';
        return;
    }

    try {
        const exposure = await determineExposureLevel(device);

        result.classList.remove('exposed', 'potentially-exposed', 'safe');

        switch (exposure) {
            case 'exposed':
                result.classList.add('exposed');
                break;
            case 'potentially-exposed':
                result.classList.add('potentially-exposed');
                break;
            case 'safe':
                result.classList.add('safe');
                break;
        }
    } catch (error) {
        console.error('Error in button.addEventListener:', error);
        result.textContent = `Error checking device: ${error.message}`;
    }
}); 

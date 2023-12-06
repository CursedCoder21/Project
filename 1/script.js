const input = document.getElementById('device-input');
const button = document.getElementById('check-button');
const result = document.getElementById('result');

button.addEventListener('click', async () => {
    result.textContent = 'Checking...';

    const device = input.value.trim();

    if (!device) {
        return (result.textContent = 'Please enter a valid IP or hostname.');
    }

    try {
        const response = await fetch(
            `https://api.shodan.io/shodan/host/${device}?key=OUPG97k2XFD2NolXbvt70gtoPORVmacT`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Log the response to the console for debugging
        console.log('Shodan API Response Data:', data);

        const exposure = determineExposureLevel(data);

        result.classList.remove('exposed', 'potentially-exposed', 'safe');
        result.classList.add(exposure);

        // Update the result text with a slight delay
        updateResultText(`Your device is ${exposure}.`);
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        result.textContent = 'An unexpected error occurred. Please try again.';
    }
});

// Function to determine exposure level based on Shodan data
const determineExposureLevel = (data) => {
    try {
        if (!data || !Array.isArray(data.ports) || !Array.isArray(data.vulns)) {
            throw new Error('Invalid response format from Shodan API');
        }

        // Check if specific ports are open
        const hasOpenPorts = data.ports.includes(22) || data.ports.includes(80);

        // Check if there are vulnerabilities
        const hasVulnerabilities = data.vulns.length > 0;

        // Determine exposure level
        if (hasOpenPorts && hasVulnerabilities) {
            return 'exposed';
        } else if (hasOpenPorts || hasVulnerabilities) {
            return 'potentially-exposed';
        } else {
            return 'safe';
        }
    } catch (error) {
        console.error('Error in determineExposureLevel:', error);
        throw error; // Re-throw the error to be caught in the catch block
    }
};

// Function to update the result text with a slight delay
const updateResultText = (text) => {
    // Introduce a delay before updating the text content
    setTimeout(() => {
        result.textContent = text;
    }, 100);
};

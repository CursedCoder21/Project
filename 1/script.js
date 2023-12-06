const input = document.getElementById('device-input');
const button = document.getElementById('check-button');
const result = document.getElementById('result');

button.addEventListener('click', async () => {
    result.textContent = 'Checking...';

    const device = input.value.trim();

    if (!device) {
        return result.textContent = 'Please enter a valid IP or hostname.';
    }

    try {
        const response = await fetch(`https://api.shodan.io/v2/host/${device}?key=OUPG97k2XFD2NolXbvt70gtoPORVmacT`);
        const data = await response.json();

        if (data.error) {
            return result.textContent = `Error: ${data.error}`;
        }

        // Analyze data to determine exposure level (based on open ports, vulnerabilities, etc.)
        let exposure = 'safe'; // Set default
        if (data.open_ports.includes(22) || data.open_ports.includes(80)) {
            exposure = 'potentially-exposed';
        }
        if (data.vulns.length > 0) {
            exposure = 'exposed';
        }

        result.classList.remove('exposed', 'potentially-exposed', 'safe');
        result.classList.add(exposure);
        result.textContent = `Your device is ${exposure}.`;
    } catch (error) {
        console.error(error);
        result.textContent = 'An unexpected error occurred. Please try again.';
    }
});

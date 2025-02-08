// Function to load and parse the CSV
function loadCSV(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error('Error loading the CSV:', error));
}

// Function to extract teams, player names, and contract years from the CSV data
function extractData(csvData) {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const teamIndex = headers.indexOf('team');  // Find the column for 'team'
    const nameIndex = headers.indexOf('name');  // Find the column for 'name'
    const yearColumns = headers.slice(3);  // The year columns start from the 4th column onward

    const teams = new Set();
    const playersByTeam = {};  // Store players grouped by their team
    const allPlayers = [];     // Store all players
    const years = new Set(yearColumns);

    // Iterate through each row (skip header)
    rows.slice(1).forEach(row => {
        const cols = row.split(',');

        if (cols[teamIndex]) {
            const team = cols[teamIndex].trim();
            const playerName = cols[nameIndex].trim();

            teams.add(team);  // Add team to the Set

            // Add player to the respective team's list
            if (!playersByTeam[team]) {
                playersByTeam[team] = [];
            }
            playersByTeam[team].push(playerName);

            // Add player to the allPlayers list
            if (!allPlayers.includes(playerName)) {
                allPlayers.push(playerName);
            }
        }
    });

    return {
        teams: Array.from(teams).sort(),
        playersByTeam,
        allPlayers,
        years: Array.from(years)
    };
}

// Function to populate a dropdown
function populateDropdown(selectId, options) {
    const selectElement = document.getElementById(selectId);

    // Clear existing options before adding new ones
    selectElement.innerHTML = '<option value="">Select an option</option>';

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

// Function to filter players based on selected team
function filterPlayersByTeam(selectedTeam, playersByTeam, allPlayers) {
    const playerSelect = document.getElementById('player');

    // If a team is selected, filter players for that team
    if (selectedTeam) {
        populateDropdown('player', playersByTeam[selectedTeam] || []);
    } else {
        // If no team is selected, show all players
        populateDropdown('player', allPlayers);
    }
}

// Load the CSV, extract data, and populate the dropdowns
loadCSV('contracts.csv', (data) => {
    const { teams, playersByTeam, allPlayers, years } = extractData(data);

    // Populate the team and year dropdowns
    populateDropdown('team', teams);
    populateDropdown('year', years);

    // Set up event listener to filter players when a team is selected
    document.getElementById('team').addEventListener('change', (event) => {
        const selectedTeam = event.target.value;
        filterPlayersByTeam(selectedTeam, playersByTeam, allPlayers);
    });

    // Initialize player dropdown with all players
    populateDropdown('player', allPlayers);
});

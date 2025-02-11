// Function to load and parse the CSV
function loadCSV(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error('Error loading the CSV:', error));
}

// Function to extract teams, players, contract years, and contracts from CSV data
function extractData(csvData) {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const teamIndex = headers.indexOf('team');
    const nameIndex = headers.indexOf('name');
    const playerIdIndex = headers.indexOf('player_id');
    const yearColumns = headers.slice(3); // Contract years start from 4th column onward

    const teams = new Set();
    const playersByTeam = {};
    const allPlayers = [];
    const years = new Set(yearColumns);
    const contracts = [];

    // Iterate through rows (skip header)
    rows.slice(1).forEach(row => {
        const cols = row.split(',');

        if (cols[teamIndex] && cols[playerIdIndex]) {
            const team = cols[teamIndex].trim();
            const playerName = cols[nameIndex].trim();
            const playerId = cols[playerIdIndex].trim(); // Store player_id properly
            const contractDetails = {};

            yearColumns.forEach((year, index) => {
                contractDetails[year] = cols[index + 3]?.trim(); // Store contract data
            });

            teams.add(team);

            if (!playersByTeam[team]) {
                playersByTeam[team] = [];
            }
            playersByTeam[team].push(playerName);

            if (!allPlayers.includes(playerName)) {
                allPlayers.push(playerName);
            }

            contracts.push({ team, playerName, playerId, contractDetails }); // Include playerId
        }
    });

    return {
        teams: Array.from(teams).sort(),
        playersByTeam,
        allPlayers,
        years: Array.from(years),
        contracts
    };
}

// Function to populate a dropdown
function populateDropdown(selectId, options) {
    const selectElement = document.getElementById(selectId);
    selectElement.innerHTML = '<option value="">Select an option</option>';

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

// Function to filter players by team
function filterPlayersByTeam(selectedTeam, playersByTeam, allPlayers) {
    populateDropdown('player', selectedTeam ? playersByTeam[selectedTeam] || [] : allPlayers);
}

// Function to update the table based on selected filters
function updateTable(selectedTeam, selectedPlayer, selectedYear, contracts) {
    const tableBody = document.getElementById('contracts');
    tableBody.innerHTML = ''; // Clear existing rows

    const filteredContracts = contracts.filter(contract =>
        (!selectedTeam || contract.team === selectedTeam) &&
        (!selectedPlayer || contract.playerName === selectedPlayer) &&
        (!selectedYear || contract.contractDetails[selectedYear]) // Only include contracts with a value for the selected year
    );

    filteredContracts.forEach(contract => {
        const row = document.createElement('tr');

        // Player Image (with correct playerId)
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = `https://www.basketball-reference.com/req/202106291/images/headshots/${contract.playerId}.jpg`; // Use contract.playerId
        img.onerror = () => (img.src = 'https://via.placeholder.com/50'); // Fallback image
        img.width = 60;
        img.height = 90;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Player Name
        const playerCell = document.createElement('td');
        playerCell.textContent = contract.playerName;
        row.appendChild(playerCell);

        // Team Name
        const teamCell = document.createElement('td');
        teamCell.textContent = contract.team;
        row.appendChild(teamCell);

        tableBody.appendChild(row);
    });
}

// Load CSV and set up event listeners
loadCSV('contracts.csv', (data) => {
    const { teams, playersByTeam, allPlayers, years, contracts } = extractData(data);
    const teamLogo = document.getElementById('team-logo');

    populateDropdown('team', teams);
    populateDropdown('year', years);
    populateDropdown('player', allPlayers);

    document.getElementById('team').addEventListener('change', (event) => {
        const selectedTeam = event.target.value;
        filterPlayersByTeam(selectedTeam, playersByTeam, allPlayers);
        // Update the logo or use a default image if no team is selected
        teamLogo.src = selectedTeam
            ? `https://cdn.ssref.net/req/202502031/tlogo/bbr/${selectedTeam}.png`
            : 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';
        updateTable(selectedTeam, document.getElementById('player').value, document.getElementById('year').value, contracts);
    });

    document.getElementById('player').addEventListener('change', (event) => {
        updateTable(document.getElementById('team').value, event.target.value, document.getElementById('year').value, contracts);
    });

    document.getElementById('year').addEventListener('change', (event) => {
        updateTable(document.getElementById('team').value, document.getElementById('player').value, event.target.value, contracts);
    });

    updateTable('', '', '', contracts); // Initially load all data
});

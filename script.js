// Function to load and parse the JSON
function loadJson(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error('Error loading the JSON:', error));
}

function populateDropdown(id, options, placeholder = `Select a ${id}`) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = ''; // Clear existing options

    const fragment = document.createDocumentFragment();

    // Add placeholder option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    fragment.appendChild(defaultOption);

    // Add actual options
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        fragment.appendChild(opt);
    });

    dropdown.appendChild(fragment);
}

// Function to extract contract years dynamically
function getContractYears(data) {
    const allYears = new Set();
    data.forEach(player => {
        Object.keys(player).forEach(key => {
            if (/^\d{4}-\d{2}$/.test(key)) { // Check if key is a year format (e.g., "2024-25")
                allYears.add(key);
            }
        });
    });
    return [...allYears].sort(); // Sort years in ascending order
}

// Function to update the table based on selected filters
function updateTable(data) {
    const table = document.getElementById('contracts');
    table.innerHTML = ''; // Clear existing content

    const selectedTeam = document.getElementById('team').value;
    const selectedPlayer = document.getElementById('player').value;
    const selectedYear = document.getElementById('year') ? document.getElementById('year').value : null;

    const filteredContracts = data.filter(contract =>
        (!selectedTeam || contract.team === selectedTeam) &&
        (!selectedPlayer || contract.name === selectedPlayer)
    );

    // Get all contract years dynamically
    const years = selectedYear ? [selectedYear] : getContractYears(data);

    // Create Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    ['', 'Player', 'Team', ...years].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create Table Body
    const tbody = document.createElement('tbody');

    filteredContracts.forEach(contract => {
        const row = document.createElement('tr');

        // Player Image
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = `https://www.basketball-reference.com/req/202106291/images/headshots/${contract.player_id}.jpg`;
        img.onerror = () => (img.src = 'https://via.placeholder.com/50'); // Fallback image
        img.width = 60;
        img.height = 90;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Player Name
        const nameCell = document.createElement('td');
        nameCell.textContent = contract.name;
        row.appendChild(nameCell);

        // Team
        const teamCell = document.createElement('td');
        teamCell.textContent = contract.team;
        row.appendChild(teamCell);

        // Contract details
        years.forEach(year => {
            const contractCell = document.createElement('td');
            contractCell.textContent = contract[year] || '-';
            row.appendChild(contractCell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
}

// Load JSON and set up event listeners
loadJson('contract.json', (data) => {
    data = JSON.parse(data);
    const team_logo = document.getElementById('team-logo');

    const teams = [...new Set(data.map(player => player.team))].sort();
    populateDropdown('team', teams);

    const names = [...new Set(data.map(player => player.name))];
    populateDropdown('player', names);

    const years = getContractYears(data)
    populateDropdown('year', years);

    updateTable(data);
    // Filter players by selected team
    document.getElementById('team').addEventListener('change', (event) => {
        const selectedTeam = event.target.value;
        const filteredPlayers = selectedTeam
            ? data.filter(player => player.team === selectedTeam)
            : data;

        // Update player dropdown with filtered players
        const filteredNames = [...new Set(filteredPlayers.map(player => player.name))];
        populateDropdown('player', filteredNames);

        // Update team logo
        team_logo.src = selectedTeam
            ? `https://cdn.ssref.net/req/202502101/tlogo/bbr/${selectedTeam}-${new Date().getFullYear()}.png`
            : 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';

        // Update table with filtered players
        updateTable(filteredPlayers);
    });
    document.getElementById('year').addEventListener('change', () => {
        const selectedTeam = document.getElementById('team').value;
        const filteredPlayers = selectedTeam
            ? data.filter(player => player.team === selectedTeam)
            : data;
        // Update table with filtered players
        updateTable(filteredPlayers);
    });
});

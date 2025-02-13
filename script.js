// Load and parse JSON
function loadJson(file, callback) {
    fetch(file)
        .then(response => response.json())
        .then(callback)
        .catch(error => console.error('Error loading JSON:', error));
}

// Populate dropdown options
function populateDropdown(id, options, placeholder = `Select a ${id}`) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '';

    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    fragment.appendChild(defaultOption);

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        fragment.appendChild(opt);
    });

    dropdown.appendChild(fragment);
}

// Extract unique contract years
function getContractYears(data) {
    return [...new Set(data.flatMap(player =>
        Object.keys(player).filter(key => /^\d{4}-\d{2}$/.test(key))
    ))].sort();
}

// Update contracts table based on filters
function updateTable(data) {
    const table = document.getElementById('contracts');
    table.innerHTML = '';

    const selectedTeam = document.getElementById('team').value;
    const selectedPlayer = document.getElementById('player').value;
    const selectedYear = document.getElementById('year')?.value || null;

    let filteredContracts = data.filter(player =>
        (!selectedTeam || player.team === selectedTeam) &&
        (!selectedPlayer || player.name === selectedPlayer)
    );

    const years = selectedYear ? [selectedYear] : getContractYears(data);

    // Sort by salary if a specific year is selected
    if (selectedYear) {
        filteredContracts.sort((a, b) => {
            const salaryA = parseSalary(a[selectedYear]);
            const salaryB = parseSalary(b[selectedYear]);
            return salaryB - salaryA; // Sort descending (highest salary first)
        });
    }

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['', 'Player', 'Team', ...years].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    filteredContracts.forEach(player => {
        const row = document.createElement('tr');

        row.appendChild(createImageCell(player.player_id));
        row.appendChild(createTextCell(player.name));
        row.appendChild(createTextCell(player.team));

        years.forEach(year => {
            row.appendChild(createTextCell(player[year] || '-'));
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
}

// Convert salary string to a number (handle cases with "$" and ",")
function parseSalary(salary) {
    if (!salary) return 0;
    return Number(salary.replace(/[$,]/g, '')) || 0;
}

// Create a table cell with an image
function createImageCell(playerId) {
    const imgCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = `https://www.basketball-reference.com/req/202106291/images/headshots/${playerId}.jpg`;
    img.onerror = () => (img.src = 'https://via.placeholder.com/50');
    img.width = 60;
    img.height = 90;
    imgCell.appendChild(img);
    return imgCell;
}

// Create a table cell with text content
function createTextCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

// Handle dropdown changes
function handleFilterChange(data) {
    const selectedTeam = document.getElementById('team').value;
    const filteredPlayers = selectedTeam ? data.filter(player => player.team === selectedTeam) : data;

    populateDropdown('player', [...new Set(filteredPlayers.map(player => player.name))]);

    document.getElementById('team-logo').src = selectedTeam
        ? `https://cdn.ssref.net/req/202502101/tlogo/bbr/${selectedTeam}-${new Date().getFullYear()}.png`
        : 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';

    updateTable(filteredPlayers);
}

// Initialize data and event listeners
loadJson('contract.json', data => {
    populateDropdown('team', [...new Set(data.map(player => player.team))].sort());
    populateDropdown('player', [...new Set(data.map(player => player.name))]);
    populateDropdown('year', getContractYears(data));

    updateTable(data);

    document.getElementById('team').addEventListener('change', () => handleFilterChange(data));
    document.getElementById('year').addEventListener('change', () => updateTable(data));
});

import requests
from bs4 import BeautifulSoup
import csv


def scrape_contracts():
    URL = "https://www.basketball-reference.com/contracts/players.html"
    headers = {"User-Agent": "Mozilla/5.0"}

    # Fetch the webpage
    response = requests.get(URL, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    # Find the table containing contracts
    table = soup.find("table", {"id": "player-contracts"})

    # Extract headers
    thead = table.find("thead")
    columns = [th.text.strip() for th in thead.find_all("th")]
    salary_years = columns[6:-1]

    # Extract player data
    players = []
    player_ids = set()
    tbody = table.find("tbody")
    for row in tbody.find_all("tr"):
        cols = row.find_all("td")
        if not cols:
            continue

        player_name_tag = cols[0].find("a")
        player_name = player_name_tag.text if player_name_tag else ""
        player_id = player_name_tag["href"].split("/")[-1].replace(".html", "") if player_name_tag else ""
        team = cols[1].text.strip()

        # Skip if player_id is already in the set
        if player_id in player_ids:
            continue

        # Extract salaries for each year
        salaries = [col.text.strip() for col in cols[2:]]

        player_data = {
            "player_id": player_id,
            "name": player_name,
            "team": team,
        }
        for year, salary in zip(salary_years, salaries):
            player_data[year] = salary

        players.append(player_data)
        player_ids.add(player_id)

    # Save to CSV
    csv_file = "contracts.csv"
    with open(csv_file, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["player_id", "name", "team"] + salary_years)
        writer.writeheader()
        writer.writerows(players)

    print(f"Data saved to {csv_file}")


def remove_contracts():
    open("contracts.csv", "w").close()


if __name__ == "__main__":
    remove_contracts()

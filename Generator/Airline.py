import os

def main():
    airline_ids = [f"AL{str(i).zfill(3)}" for i in range(1, 21)]
    airline_names = [
        "Qatar Airways", "Singapore Airlines", "Emirates", "ANA All Nippon Airways", "Cathay Pacific",
        "Japan Airlines", "Turkish Airlines", "EVA Air", "Air France", "Swiss International Air Lines",
        "Korean Air", "Hainan Airlines", "British Airways", "Fiji Airways", "Iberia",
        "Vistara", "Virgin Atlantic", "Lufthansa", "Etihad Airways", "Saudi Arabian Airlines"
    ]

    query = "INSERT INTO airlines (airlineid, airline_name) VALUES\n"
    values = ",\n".join([f"('{airline_ids[i]}', '{airline_names[i]}')" for i in range(20)])
    query += values + ";"

    # Ensure the Generator directory exists
    os.makedirs("Generator", exist_ok=True)

    with open("Generator/Airline.txt", "w") as file:
        file.write(query + "\n")


if __name__ == "__main__":
    main()
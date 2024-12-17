def main():
    airport_id = [f"AP{str(i).zfill(3)}" for i in range(4, 12)]

    airport_name = ["Cam Ranh International Airport", "Phu Quoc International Airport",
                    "Cat Bi International Airport", "Can Tho International Airport",
                    "Vinh International Airport", "Van Don International Airport",
                    "Lien Khuong International Airport", "Long Thanh International Airport"]

    city = ["Nha Trang", "Phu Quoc", "Hai Phong", "Can Tho", "Vinh", "Quang Ninh", "Da Lat", "Dong Nai"]


    query = "INSERT INTO airport (airportid, airport_name, city, country) VALUES\n"
    values = ",\n".join([f"('{airport_id[i]}', '{airport_name[i]}', '{city[i]}', 'Viet Nam')" for i in range(8)])
    query += values + ";"

    with open("Airport.txt", "w") as file:
        file.write(query + "\n")


if __name__ == "__main__":
    main()

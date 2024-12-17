def main():
    seat_numbers = [f"SE{str(i).zfill(3)}" for i in range(1, 301)]
    class_types = []

    for i in range(1, 301):
        if 1 <= i <= 10:
            class_types.append("First Class")
        elif 11 <= i <= 30:
            class_types.append("Business")
        else:
            class_types.append("Economy")

    query = "INSERT INTO seat (seat_number, class_type) VALUES\n"
    values = ",\n".join([f"('{seat_numbers[i]}', '{class_types[i]}')" for i in range(300)])
    query += values + ";"

    with open("Seat.txt", "w") as file:
        file.write(query + "\n")


if __name__ == "__main__":
    main()

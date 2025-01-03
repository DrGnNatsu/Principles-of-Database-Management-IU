# Flight Booking Application

This project is a flight booking application built with a Next.js frontend and a Java Spring Boot backend. It allows users to search for flights, view available options, book tickets, and manage their bookings. This project was developed as part of the Principles of Database Management course at IU.

## Features

* Search Flights: Search for flights based on origin, destination, and travel dates.
* View Flight Details: View detailed information about available flights, including pricing, seat availability, and flight duration.
* Book Flights: Select desired flights, choose seats, and complete the booking process.
* Manage Bookings: View and manage existing bookings, including cancellation and modification options (if implemented).

## Technologies Used

* **Frontend:** Next.js, React, JavaScript/TypeScript
* **Backend:** Java Spring Boot, Spring Data JPA, REST APIs, Maven
* **Database:** [Specify the database used, e.g., MySQL]  Include version if relevant.
* **Other:** [List any other relevant technologies, e.g., deployment tools (Docker)]

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Java JDK [Version 17]
* Node.js and npm/yarn 
* Maven 
* [MySQL 8.0] - Ensure it's running.


### Installing

**Full Stack Setup (Recommended if you intend to run both frontend and backend locally):**

1. Clone the repository:
   ```bash
   git clone https://github.com/DrGnNatsu/Principles-of-Database-Management-IU.git

2. Run the backend
   ```bash
   docker pull mysql/mysql-server:latest
   docker run -e "ACCEPT_EULA=1" -e "MSSQL_SA_PASSWORD=123456Aa@$" -e "MSSQL_PID=Developer" -e "MSSQL_USER=root" -p 1433:1433 -d --name=pdmdb mysql/mysql-server:latest
   docker-compose up -d
   cd backend
--> run mainApplication file

3. Run the Front end
   ```bash
   cd airport-passengers-maintenance
   npm install #
   npm run dev

---
## Contribution of the Team
| Members                    | Positions                                                  | Contribution
| :--------                  | :-------                                                   |:-------:
| Pham Hoang Phuong          | Project Manager (Leader), Full-stack, Design Website       | 20 %
| Pham Anh Khoi              | Database Design, Front-end, Report                         | 20 %
| Nguyen Vu Thanh Tinh       | Database Design, Report                                    | 20 %
| Dang Ngoc Thai Son         | Front-end                                                  | 20 %
| Hoang An Thien             | Front-end                                                  | 20 %

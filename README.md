# Astro Booking System

Welcome to the Astro Booking System! This project is designed to help users book astronomical observation sessions easily and efficiently.

## Table of Contents

-   [Introduction](#introduction)
-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Configuration](#configuration)
-   [Contributing](#contributing)
-   [License](#license)

## Introduction

The Astro Booking System is a web-based application that allows users to book time slots for astronomical observations. It provides a user-friendly interface and integrates with various astronomical observatories.

## Features

-   User registration and authentication
-   Booking management
-   Email notifications for booking confirmations
-   Admin panel for managing bookings and users
-   Integration with observatory APIs

## Installation

To install the Astro Booking System, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/astro-booking-system.git
    ```
2. Navigate to the project directory:
    ```bash
    cd astro-booking-system
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Usage

To start the application, run the following command:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Configuration

The application requires some configuration for email notifications and API keys. Update the `passwords.json` file with your credentials:

```json
{
    "websocketkey": "YourWebSocketKey",
    "adminkey": "YourAdminKey",
    "confirmationEmail": {
        "host": "smtp.gmail.com",
        "port": 465,
        "secure": true,
        "auth": {
            "user": "your-email@gmail.com",
            "pass": "your-email-password"
        }
    }
}
```

## Contributing

We welcome contributions to the Astro Booking System! Please fork the repository and submit pull requests for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

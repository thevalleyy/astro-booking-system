# Astro Booking System

[![Last Commit](https://img.shields.io/github/last-commit/thevalleyy/astro-booking-system/main?style=plastic)](https://github.com/thevalleyy/astro-booking-system/commits/main)
[![Version](https://img.shields.io/github/package-json/v/thevalleyy/astro-booking-system?style=plastic)](https://github.com/thevalleyy/astro-booking-system/blob/master/package.json#L3)
[![Size](https://img.shields.io/github/languages/code-size/thevalleyy/astro-booking-system?style=plastic)](https://www.youtube.com/watch?v=DgJS2tQPGKQ)

Welcome to the Astro Booking System! This project is designed to help users book any event (astronomical observation sessions in our case) easily and efficiently.

It was created by [Dodorex-code](https://github.com/Dodorex-code), [thevalleyy](https://github.com/thevalleyy) and [Xanover](https://github.com/Xanover) as a project in computer science. The source code is licensed under the GNU General Public License v3.0

## Table of Contents

-   [Introduction](#introduction)
-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Configuration](#configuration)
-   [Contributing](#contributing)
-   [License](#license)

## Introduction

The Astro Booking System is a web-based application that allows users to book time slots for events. It is powered by Node.JS and the Next.JS framework. The data is stored in a local JSON file and can be managed through an admin panel. The application also sends email notifications to users when they book a slot.

## Features

-   Fully customizable & configurable
-   Booking without registration
-   Email notifications for booking confirmations
-   Admin panel for managing bookings
-   WebSocket integration for real-time updates

## Installation

To install the Astro Booking System, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/thevalleyy/astro-booking-system.git
    ```
2. Navigate to the project directory:
    ```bash
    cd astro-booking-system
    ```

## Usage

To start the application, run the following command:

```bash
npm run fullstart
```

The application will be available at `http://localhost:3000`. The websocket server will be available at `ws://localhost:8080`.

Note: These ports can be changed in the `config.json` file.

## Configuration

Nearly every aspect of the Astro Booking System can be configured to suit your needs. The configuration file is located at `config.json`. A complete list of configuration options can be found in the [config.md](config.md) file.

The application requires some configuration for email notifications and passwords. Update the `passwords.json` file with your credentials:

| Key                           | Description                                                   | Type      | Default            |
| ----------------------------- | ------------------------------------------------------------- | --------- | ------------------ |
| `websocketkey`                | Key used to authenticate websocket messages                   | `string`  | `"WebSocketKey"`   |
| `adminkey`                    | Key used to access the admin panel                            | `string`  | `"AdminKey"`       |
| `confirmationEmail.host`      | SMTP server host for sending emails                           | `string`  | `"smtp.gmail.com"` |
| `confirmationEmail.port`      | Port for the SMTP server                                      | `number`  | `465`              |
| `confirmationEmail.secure`    | Whether the connection to the SMTP server is secure (SSL/TLS) | `boolean` | `true`             |
| `confirmationEmail.auth.user` | Email address used for SMTP authentication                    | `string`  | `"email"`          |
| `confirmationEmail.auth.pass` | Password for the SMTP email account                           | `string`  | `"pwd"`            |

## Contributing

We welcome contributions to the Astro Booking System! Please fork the repository and submit pull requests for any enhancements or bug fixes.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

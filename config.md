[Back to README](README.md)

## `config.json`

| Key                              | Description                                                   | Type      | Default                                                             |
| -------------------------------- | ------------------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| `settings.enabled`               | Enable or disable booking new slots. Also set via admin panel | `boolean` | `true`                                                              |
| `settings.port`                  | Port of the webpage                                           | `number`  | `3000`                                                              |
| `settings.wsPort`                | Port of the websocket server                                  | `number`  | `8080`                                                              |
| `settings.title`                 | Webpage title                                                 | `string`  | `"Astro Booking System"`                                            |
| `settings.wsURL`                 | Websocket server URL                                          | `string`  | `"ws://localhost:8080"`                                             |
| `settings.imprintURL`            | URL for the imprint page                                      | `string`  | `"https://example.com/imprint"`                                     |
| `settings.adminMail`             | Email address of the admin, is displayed on index page        | `string`  | `"admin@expample.com"`                                              |
| `settings.start`                 | Starting time for booking slots                               | `string`  | `"18:00"`                                                           |
| `settings.end`                   | Ending time for booking slots                                 | `string`  | `"21:00"`                                                           |
| `settings.increment`             | Time increment between slots                                  | `string`  | `"00:20"`                                                           |
| `settings.slotsPerColumn`        | Number of slots available per timeslot                        | `number`  | `16`                                                                |
| `settings.default.lastname`      | Default value for the last name field                         | `string`  | `""`                                                                |
| `settings.default.firstname`     | Default value for the first name field                        | `string`  | `""`                                                                |
| `settings.default.email`         | Default value for the email field                             | `string`  | `""`                                                                |
| `settings.default.bookedSlots`   | Default value for booked slots                                | `number`  | `0`                                                                 |
| `settings.checks.lastname`       | Maximum length for last name                                  | `number`  | `50`                                                                |
| `settings.checks.firstname`      | Maximum length for first name                                 | `number`  | `50`                                                                |
| `settings.checks.email`          | Whether to validate emails of users                           | `boolean` | `true`                                                              |
| `settings.checks.maxBookedSlots` | Maximum number of slots a user can book                       | `number`  | `5`                                                                 |
| `mail.sender`                    | Name of the email sender                                      | `string`  | `"Astro Booking System"`                                            |
| `mail.mailSubject`               | Subject of the confirmation email                             | `string`  | `"Confirmation for booking !BOOKEDSLOTS slot(s)"`                   |
| `mail.mailText`                  | Text of the confirmation email                                | `string`  | Detailed mail body with placeholders (see `config.json`)            |
| `mail.editMailSubject`           | Subject of the email for edited bookings                      | `string`  | `"We have edited your booking for the event"`                       |
| `mail.editMailText`              | Text of the email for edited bookings                         | `string`  | Detailed mail body with placeholders (see `config.json`)            |
| `mail.deleteMailSubject`         | Subject of the email for cancelled bookings                   | `string`  | `"We have canceled your booking for the event"`                     |
| `mail.deleteMailText`            | Text of the email for cancelled bookings                      | `string`  | Detailed mail body with placeholders (see `config.json`)            |
| `log.enabled`                    | Enable or disable logging                                     | `boolean` | `false`                                                             |
| `log.ips`                        | Log IP addresses of users                                     | `boolean` | `true`                                                              |
| `log.requests`                   | Log incoming requests                                         | `boolean` | `true`                                                              |
| `log.log_path`                   | Path to the log directory                                     | `string`  | `"./logs/"`                                                         |
| `log.log_extension`              | File extension for log files                                  | `string`  | `".log"`                                                            |
| `html-meta-data.title`           | Title for the HTML metadata                                   | `string`  | `"I forgot to customize my project!"`                               |
| `html-meta-data.description`     | Description for the HTML metadata                             | `string`  | `"Book your visit!"`                                                |
| `html-meta-data.url`             | URL for the HTML metadata                                     | `string`  | `"https://astro.example.com/"`                                      |
| `html-meta-data.image`           | Image URL for the HTML metadata                               | `string`  | `"https://apod.nasa.gov/apod/image/1611/PacmanCrawfordNew2048.jpg"` |
| `html-meta-data.large_image`     | Whether the metadata image should appear large                | `boolean` | `true`                                                              |
| `html-meta-data.color`           | Color for the HTML metadata                                   | `string`  | `"#b58ef2"`                                                         |

The placeholders for the mail stings are as follows:

| Placeholder    | Description              |
| -------------- | ------------------------ |
| `!FIRSTNAME`   | First name of client     |
| `!LASTNAME`    | Last name of client      |
| `!EMAIL`       | E-Mail address of client |
| `!BOOKEDSLOTS` | Number of booked slots   |
| `!TIMESLOT`    | Time slot of booking     |

All placeholders with a `NEW` in front of them are used to distinguish between the old and new values in case of an edited booking.

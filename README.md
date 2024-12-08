### config.json

```json
{
    "settings": {
        "port": 3000,
        "imprintURL": "https://example.com/imprint",
        "start": "18:00",
        "end": "21:00",
        "increment": "00:20",
        "slotsPerColumn": 8,
        "checks": {
            "lastname": 30,
            "firstname": 30,
            "email": true,
            "maxBookedSlots": 5
        }
    },
    "log": {
        "enabled": false,
        "ips": true,
        "requests": true,
        "log_path": "./logs/",
        "log_extension": ".log"
    },
    "html-meta-data": {
        "title": "Abend der Astronomie",
        "description": "Buchen Sie Ihren Termin!",
        "url": "https://astro.example.com/",
        "image": "https://apod.nasa.gov/apod/image/1611/PacmanCrawfordNew2048.jpg",
        "large_image": true,
        "color": "#000181"
    }
}
```

### passwords.json

```json
{
    "websocketkey": "WebSocketKey",
    "adminkey": "AdminKey",
    "adminPassword": "admin",
    "confirmationEmail": {
        "service": "gmail",
        "serverEmailAddress": "test@mail.com",
        "serverEmailPassword": "notInPlainText"
    }
}
```

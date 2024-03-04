# Chromium Notifications Retriever

A TypeScript library for retrieving notifications saved by Chromium-based browsers.

## Installation

```bash
npm install chromium-notification-retriever
```

## Usage

```javascript
const { Retriever } = require("chromium-notification-retriever");

// Specify the path to the LevelDB database where your browser stores notification information
// E.g. "C:/Users/<username>/AppData/Local/Microsoft/Edge/User Data/Default/Platform Notifications"
// for a default Edge installation on Windows
const dbPath = "/path/to/your/chromium/db";

// Optional: Provide configuration options
const options = {
  refreshOnRetrieve: true, // Whether to refresh the database on each retrieval (default: true)
};

// Create a new Retriever instance
const retriever = new Retriever(dbPath, options);

// Retrieve notifications
retriever.retrieve({ limit: 10 }).then((notifications) => {
  notifications.forEach((notification) => {
    // Access notifications
    console.log(notification);
  });
});

// Retrieve a specific notification by its key
const key = "notification_key";
const notification = await retriever.get(key);

if (notification) console.log(notification);
else console.log("Notification not found.");
```

## API Reference

### `Retriever`

#### `constructor(dbPath: string, options?: RetrieverOptions): Retriever`

Creates a new `Retriever` instance.

- `dbPath`: Path to the LevelDB database where the browser stores notification information.
- `options` (optional): Configuration options.

#### `refresh(): void`

Makes a new copy of the notification database with up-to-date notifications.
Unnecessary if `refreshOnRetrieve` is enabled.

#### `retrieve(limit?: number): Promise<NotificationInfo[]>`

Retrieves notifications from the database.

- `limit` (optional): Maximum number of notifications to retrieve.

#### `get(key: string): Promise<NotificationInfo | undefined>`

Retrieves a specific notification by its key.

- `key`: The key of the notification.

Returns a notification if one exists with that key, or `undefined` otherwise.

#### `destroy(): void`

Deletes the copy of the notification database.

Note that old copies of databases are always deleted when you import `Retriever`, so calling this is not necessary.

## License

This project is licensed under the [MIT License](LICENSE).

import protobuf from "protobufjs";
import * as path from "path";
import { Level } from "level";
import * as fs from "fs";
import { DbNotFoundError } from "./errors";
import { NotificationInfo } from "./types";
import { createHash } from "crypto";

const COPY_DB_ROOT_PATH = path.join(__dirname, "db");

cleanUpDbDir();

function cleanUpDbDir() {
  fs.rmSync(COPY_DB_ROOT_PATH, { recursive: true, force: true });
}

function isDb(path: string) {
  return fs.readdirSync(path).some((entry) => entry.split(".")[1] === "ldb");
}

function createCopyDbDir(originalPath: string) {
  const dirName = createHash("md5").update(originalPath).digest("hex");

  const copyDirPath = path.join(COPY_DB_ROOT_PATH, dirName);

  fs.mkdirSync(copyDirPath, { recursive: true });

  return copyDirPath;
}

function copyDb(path: string): string;
function copyDb(_path: string) {
  const copyDbDirPath = createCopyDbDir(_path);

  fs.readdirSync(_path).forEach((filename) => {
    fs.copyFileSync(
      path.join(_path, filename),
      path.join(copyDbDirPath, filename)
    );
  });

  return copyDbDirPath;
}

function createDb(path: string): Level<string, Uint8Array>;
function createDb(_path: string) {
  if (!isDb(_path)) {
    throw new DbNotFoundError(_path);
  }

  const copyDbDirPath = copyDb(_path);

  return new Level<string, Uint8Array>(copyDbDirPath, {
    createIfMissing: false,
    keyEncoding: "utf-8",
    valueEncoding: "buffer",
  });
}

export type RetrieverOptions = {
  refreshOnRetrieve: boolean;
};

/**
 * Retrieves notifications from Chromium-based browsers
 */
export class Retriever {
  static #initPromise: Promise<null> | null;
  static #protoType: protobuf.Type;
  #dbPath: string;
  #db?: Level<string, Uint8Array>;
  #options: RetrieverOptions;

  static #loadProtoType() {
    if (this.#protoType || this.#initPromise) return;

    this.#initPromise = new Promise((resolve, reject) => {
      protobuf.load(
        path.join(__dirname, "./proto/notification_database_data.proto"),
        (err, root) => {
          if (err || !root) {
            reject(
              new Error(
                "Something went wrong while loading the notification data proto file.",
                { cause: err }
              )
            );
          } else {
            this.#protoType = root.lookupType(
              "content.NotificationDatabaseDataProto"
            );

            this.#initPromise = null;

            resolve(null);
          }
        }
      );
    });
  }

  static #decode(key: string, value: Uint8Array) {
    const message = Retriever.#protoType.decode(value);
    const notificationInfo = Retriever.#protoType.toObject(message);

    notificationInfo.key = key;
    const decoder = new TextDecoder();
    notificationInfo.notificationData.data = decoder.decode(
      notificationInfo.notificationData.data
    );

    return notificationInfo as NotificationInfo;
  }

  /**
   * Makes a new copy of the notification database with up-to-date notifications.
   * Unnecessary if `refreshOnRetrieve` is enabled.
   */
  refresh() {
    this.#refresh();
  }

  #refresh() {
    if (!this.#db || this.#options.refreshOnRetrieve) {
      this.#db = createDb(this.#dbPath);
    }
    if (Retriever.#initPromise) {
      return Retriever.#initPromise;
    }
  }

  /**
   *
   * @param dbPath Path to the LevelDB database where the browser stores notification information
   * @param options
   */
  constructor(
    dbPath: string,
    options: RetrieverOptions = { refreshOnRetrieve: true }
  ) {
    this.#dbPath = dbPath;
    this.#options = options;
    Retriever.#loadProtoType();
  }

  /**
   * Retrieves up to `limit` notifications from the database
   * @param limit Maximum number of notifications to retrieve
   * @returns Array of notifications
   */
  async retrieve(limit?: number) {
    await this.#refresh();

    const result = [];

    for await (const [key, value] of this.#db!.iterator({
      limit,
    })) {
      result.push(Retriever.#decode(key, value));
    }

    return result;
  }

  /**
   * Retrieves one notification by its key (not `notificationId`)
   * @param key
   * @returns A notification, if one exists with that key, or `undefined` otherwise
   */
  async get(key: string) {
    await this.#refresh();
    try {
      const value = await this.#db!.get(key);
      return Retriever.#decode(key, value);
    } catch (error) {
      if (error.code === "LEVEL_NOT_FOUND") return;
      throw error;
    }
  }

  /**
   * Deletes the copy of the notification database.
   * Note that old copies of databases are always deleted when you import `Retriever`,
   * so calling this is not necessary.
   */
  destroy() {
    cleanUpDbDir();
  }
}

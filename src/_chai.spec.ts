import { Deferred, Log, setLogger } from "batch-cluster"
import { expect } from "chai"
import crypto, { randomBytes } from "crypto"
import { copyFile, createReadStream, mkdirp } from "fs-extra"
import os from "os"
import path from "path"
import process from "process"
import { DateOrTime, toExifString } from "./DateTime"
import { Maybe } from "./Maybe"
import { fromEntries } from "./Object"
import { isString } from "./String"
import { Tags } from "./Tags"

const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.use(require("chai-subset"))

// Tests should be quiet unless LOG is set
setLogger(
  Log.withLevels(
    Log.withTimestamps(
      Log.filterLevels(
        {
          trace: console.log,
          debug: console.log,
          info: console.log,
          warn: console.warn,
          error: console.error,
        },
        (process.env.LOG as any) ?? "error"
      )
    )
  )
)

export { expect } from "chai"

export const testDir = path.join(__dirname, "..", "test")

export function randomChars(chars = 8) {
  return randomBytes(chars / 2).toString("hex")
}

export function tmpname(prefix = ""): string {
  return path.join(os.tmpdir(), prefix + randomChars())
}

export function renderTagsWithISO(t: Tags) {
  return fromEntries(
    Object.entries(t).map(([k, v]) =>
      k === "SourceFile" ? undefined : [k, v["toISOString"]?.() ?? v]
    )
  )
}

export function renderTagsWithRawValues(t: Tags) {
  return fromEntries(Object.entries(t).map(([k, v]) => [k, v["rawValue"]]))
}

/**
 * Copy a test image to a tmp directory and return the path
 */
export async function testImg(
  name = "img.jpg",
  parentDir = "test"
): Promise<string> {
  const dir = path.join(tmpname(), parentDir)
  await mkdirp(dir)
  const dest = path.join(dir, name)
  return copyFile(path.join(testDir, name), dest).then(() => dest)
}

export async function testFile(name: string): Promise<string> {
  const dir = tmpname()
  await mkdirp(dir)
  return path.join(dir, name)
}

export function sha1(path: string): Promise<string> {
  const d = new Deferred<string>()
  const readStream = createReadStream(path, { autoClose: true })
  const sha = crypto.createHash("sha1")
  readStream.on("data", (ea) => sha.update(ea))
  readStream.on("error", (err) => d.reject(err))
  readStream.on("end", () => d.resolve(sha.digest().toString("hex")))
  return d.promise
}

export function sha1buffer(input: string | Buffer): string {
  return crypto.createHash("sha1").update(input).digest().toString("hex")
}

export function isWin32() {
  return os.platform() === "win32"
}

function dateishToExifString(d: Maybe<DateOrTime | string>): Maybe<string> {
  return d == null ? undefined : isString(d) ? d : toExifString(d)
}

export function assertEqlDateish(
  a: Maybe<string | DateOrTime>,
  b: Maybe<string | DateOrTime>
) {
  return expect(dateishToExifString(a)).to.eql(dateishToExifString(b))
}

import assert from "assert"
import crypto from "crypto"
import path from "path"
import { BinaryToBufferTask } from "./BinaryToBufferTask"
import { ExifTool } from "./ExifTool"
import { expect, sha1buffer } from "./_chai.spec"

const testDir = path.join(__dirname, "..", "test")
describe("BinaryToBufferTask", () => {
  const exiftool = new ExifTool({ maxProcs: 1 })
  after(() => exiftool.end())

  describe("parser", () => {
    const sut = BinaryToBufferTask.for("ThumbnailImage", "")
    it("returns success (undefined, no error) from expected input", () => {
      const result = sut.parse(
        JSON.stringify([
          { SourceFile: "test.jpg", ThumbnailImage: "base64:aGVsbG8gd29ybGQ=" },
        ])
      )
      expect(result.toString()).to.eql("hello world")
    })
    it("returns error from unexpected input", () => {
      expect(sut.parse("invalid").toString()).to.match(/invalid/)
    })
    it("throws on empty input", () => {
      expect(sut.parse("").toString()).to.match(/Unexpected end of JSON input/i)
    })
    it("returns any provided errors", () => {
      const err = new Error(crypto.randomBytes(3).toString("hex"))
      expect(sut.parse("", err).toString()).to.include(err.message)
    })
  })

  it("extracts expected thumb", async function () {
    this.slow(500)
    const src = path.join(testDir, "with_thumb.jpg")
    const buf = await exiftool.extractBinaryTagToBuffer("ThumbnailImage", src)
    // exiftool with_thumb.jpg -b -ThumbnailImage | sha1sum
    expect(sha1buffer(buf)).to.eql("57885e5e16b16599ccf208981a87fe198612d9fb")
  })

  it("throws for missing src", async function () {
    this.slow(500)
    const src = path.join(testDir, "nonexistant-file.jpg")
    try {
      await exiftool.extractBinaryTagToBuffer("JpgFromRaw", src)
      assert.fail("expected error to be thrown")
    } catch (err) {
      expect(String(err)).to.match(/File not found/i)
    }
  })

  it("throws for missing thumb", async function () {
    this.slow(500)
    const src = path.join(testDir, "with_thumb.jpg")
    try {
      await exiftool.extractBinaryTagToBuffer("JpgFromRaw", src)
      assert.fail("expected error to be thrown")
    } catch (err) {
      expect(String(err)).to.match(/JpgFromRaw not found/i)
    }
  })
})

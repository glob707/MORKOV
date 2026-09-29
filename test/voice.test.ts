import { describe, expect, it, vi } from "vitest";
import { createVoiceControls, missingVoiceMethods, VOICE_METHODS } from "../src/voice";

function fakeLog() {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
}

function fakeConnection() {
  return { setLocalPan: vi.fn(), setLocalVolume: vi.fn(), setLocalMute: vi.fn(), setUserPosition: vi.fn() };
}

describe("missingVoiceMethods", () => {
  it("finds nothing missing on a full connection", () => {
    expect(missingVoiceMethods(fakeConnection())).toEqual([]);
  });

  it("names the methods a connection lacks", () => {
    const connection = { ...fakeConnection(), setLocalPan: undefined, setLocalMute: "not a function" };
    expect(missingVoiceMethods(connection)).toEqual(["setLocalPan", "setLocalMute"]);
  });

  it("treats a missing connection as missing everything", () => {
    expect(missingVoiceMethods(undefined)).toEqual(VOICE_METHODS);
  });
});

describe("createVoiceControls", () => {
  it("passes valid calls through to the connection", () => {
    const connection = fakeConnection();
    const voice = createVoiceControls(connection, fakeLog());
    const position = { x: 1, y: 0, z: 0 };

    expect(voice.setLocalPan("42", 0.3, 1)).toBe(true);
    expect(voice.setLocalVolume("42", 50)).toBe(true);
    expect(voice.setLocalMute("42", true)).toBe(true);
    expect(voice.setUserPosition("42", position)).toBe(true);

    expect(connection.setLocalPan).toHaveBeenCalledWith("42", 0.3, 1);
    expect(connection.setLocalVolume).toHaveBeenCalledWith("42", 50);
    expect(connection.setLocalMute).toHaveBeenCalledWith("42", true);
    expect(connection.setUserPosition).toHaveBeenCalledWith("42", position);
  });

  it("keeps the connection as this, since native methods need it", () => {
    const connection = {
      ...fakeConnection(),
      setLocalVolume(this: unknown) {
        expect(this).toBe(connection);
      },
    };
    expect(createVoiceControls(connection, fakeLog()).setLocalVolume("42", 50)).toBe(true);
  });

  it.each([
    ["an empty userId", (v: ReturnType<typeof createVoiceControls>) => v.setLocalPan("", 0, 1)],
    ["a NaN pan", (v: ReturnType<typeof createVoiceControls>) => v.setLocalPan("42", NaN, 1)],
    ["an infinite volume", (v: ReturnType<typeof createVoiceControls>) => v.setLocalVolume("42", Infinity)],
    ["a non-boolean mute", (v: ReturnType<typeof createVoiceControls>) => v.setLocalMute("42", 1 as unknown as boolean)],
    ["a missing position", (v: ReturnType<typeof createVoiceControls>) => v.setUserPosition("42", undefined)],
  ])("does not send %s to native code", (_case, send) => {
    const connection = fakeConnection();
    const log = fakeLog();

    expect(send(createVoiceControls(connection, log))).toBe(false);

    for (const method of VOICE_METHODS) expect(connection[method]).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledOnce();
  });

  it("reports a method the connection lacks instead of throwing", () => {
    const log = fakeLog();
    const voice = createVoiceControls({}, log);

    expect(voice.setLocalMute("42", false)).toBe(false);
    expect(log.error).toHaveBeenCalledWith("setLocalMute is not available on the voice connection");
  });

  it("catches an error thrown by the engine", () => {
    const connection = fakeConnection();
    const failure = new Error("engine gone");
    connection.setLocalPan.mockImplementation(() => {
      throw failure;
    });
    const log = fakeLog();

    expect(createVoiceControls(connection, log).setLocalPan("42", 0, 1)).toBe(false);
    expect(log.error).toHaveBeenCalledWith("setLocalPan failed", failure);
  });

  it("logs every successful call at debug level", () => {
    const log = fakeLog();

    createVoiceControls(fakeConnection(), log).setLocalVolume("42", 80);

    expect(log.debug).toHaveBeenCalledWith("setLocalVolume", "42", 80);
  });
});

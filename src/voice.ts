import type { Logger } from "./log";

export type UserId = string;

/**
 * Per-user audio controls of a native voice connection, as bound in
 * discord_voice/index.js (app-0.0.413). Unofficial: any Discord update may
 * rename or drop them, so connections are checked with missingVoiceMethods().
 */
export interface NativeVoiceConnection {
  /** Scale of left/right is not confirmed yet (OQ-1). */
  setLocalPan(userId: UserId, left: number, right: number): void;
  setLocalVolume(userId: UserId, volume: number): void;
  setLocalMute(userId: UserId, mute: boolean): void;
  /** Shape of position is not confirmed yet; passed through as is. */
  setUserPosition(userId: UserId, position: unknown): void;
}

export type VoiceMethod = keyof NativeVoiceConnection;

export const VOICE_METHODS: readonly VoiceMethod[] = [
  "setLocalPan",
  "setLocalVolume",
  "setLocalMute",
  "setUserPosition",
];

/** Same controls, but they never throw: false means the call did not reach the engine. */
export type VoiceControls = {
  [M in VoiceMethod]: (...args: Parameters<NativeVoiceConnection[M]>) => boolean;
};

export function missingVoiceMethods(connection: unknown): VoiceMethod[] {
  if (typeof connection !== "object" || connection === null) return [...VOICE_METHODS];
  const methods = connection as Record<string, unknown>;
  return VOICE_METHODS.filter((name) => typeof methods[name] !== "function");
}

export function createVoiceControls(connection: unknown, log: Logger): VoiceControls {
  const call = (method: VoiceMethod, args: unknown[], problem: string | null): boolean => {
    // Garbage must never reach native code: a bad argument there can crash the client.
    if (problem) {
      log.error(`${method} rejected: ${problem}`, ...args);
      return false;
    }
    const fn = (connection as Record<string, unknown> | null)?.[method];
    if (typeof fn !== "function") {
      log.error(`${method} is not available on the voice connection`);
      return false;
    }
    try {
      fn.apply(connection, args);
    } catch (error) {
      log.error(`${method} failed`, error);
      return false;
    }
    log.debug(method, ...args);
    return true;
  };

  return {
    setLocalPan: (userId, left, right) =>
      call("setLocalPan", [userId, left, right], checkUserId(userId) ?? checkNumber("left", left) ?? checkNumber("right", right)),
    setLocalVolume: (userId, volume) =>
      call("setLocalVolume", [userId, volume], checkUserId(userId) ?? checkNumber("volume", volume)),
    setLocalMute: (userId, mute) =>
      call("setLocalMute", [userId, mute], checkUserId(userId) ?? (typeof mute === "boolean" ? null : "mute is not a boolean")),
    setUserPosition: (userId, position) =>
      call("setUserPosition", [userId, position], checkUserId(userId) ?? (position == null ? "position is missing" : null)),
  };
}

function checkUserId(userId: unknown): string | null {
  return typeof userId === "string" && userId !== "" ? null : "userId is not a non-empty string";
}

function checkNumber(name: string, value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value) ? null : `${name} is not a finite number`;
}

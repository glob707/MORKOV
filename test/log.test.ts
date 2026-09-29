import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/log";

function fakeSink() {
  return { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe("createLogger", () => {
  it("prefixes every message", () => {
    const sink = fakeSink();
    const log = createLogger(() => false, sink);

    log.info("started");
    log.warn("careful");
    log.error("broken", 42);

    expect(sink.log).toHaveBeenCalledWith("[MORKOV]", "started");
    expect(sink.warn).toHaveBeenCalledWith("[MORKOV]", "careful");
    expect(sink.error).toHaveBeenCalledWith("[MORKOV]", "broken", 42);
  });

  it("drops debug messages while debug logs are off", () => {
    const sink = fakeSink();
    const log = createLogger(() => false, sink);

    log.debug("slot assigned");

    expect(sink.log).not.toHaveBeenCalled();
  });

  it("re-reads the debug flag on every call", () => {
    const sink = fakeSink();
    let debug = false;
    const log = createLogger(() => debug, sink);

    log.debug("hidden");
    debug = true;
    log.debug("shown");

    expect(sink.log).toHaveBeenCalledTimes(1);
    expect(sink.log).toHaveBeenCalledWith("[MORKOV]", "[debug]", "shown");
  });
});

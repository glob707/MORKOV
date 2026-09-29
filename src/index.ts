import { createLogger } from "./log";

declare const __MARKVI_VERSION__: string;

/**
 * BetterDiscord plugin entry point. BetterDiscord instantiates this class
 * and calls start()/stop() when the plugin is enabled/disabled.
 */
export default class MARKVI {
  private readonly log = createLogger(() => false);

  start(): void {
    this.log.info(`started v${__MARKVI_VERSION__}`);
  }

  stop(): void {
    this.log.info("stopped");
  }
}

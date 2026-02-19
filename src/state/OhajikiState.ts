import * as fsm from "../finite-state-machine";
import type { System } from "../System";
import type { OhajikiActionData, OhajikiCommand } from "../coeMessages";

/**
 * おはじき用ステート。
 */
export type OhajikiState = fsm.State<System, OhajikiActionData, OhajikiCommand>;

/**
 * おはじき用ステートマネージャ。
 */
export class OhajikiStateManager extends fsm.StateManager<System, OhajikiActionData, OhajikiCommand> {}

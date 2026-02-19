import type { OhajikiState } from "./OhajikiState";
import type { OhajikiCommand } from "../coeMessages";
import type { System } from "../System";

/**
 * おはじきステート基底クラス。
 *
 * 派生クラス実装の便宜。
 */
export class BaseState implements OhajikiState {
	enter(_context: System): void { /* nop */ }
	update(_context: System): OhajikiState | null { return null; }
	leave(_context: System): void { /* nop */ }
	command(_context: System, _command: OhajikiCommand): OhajikiState | null { return null; }
	pointDown(_context: System, _ev: g.PointDownEvent): void { /* nop */ }
	pointMove(_context: System, _ev: g.PointMoveEvent): void { /* nop */ }
}

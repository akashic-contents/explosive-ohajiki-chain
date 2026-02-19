import type { State } from "./State";
import { Logger } from "../Logger";

export class NullState<T, D, C> implements State<T, D, C> {
	update(_context: T): State<T, D, C> | null { return null; }
	enter(_context: T): void { /* nop */ }
	leave(_context: T): void { /* nop */ }
	command(_context: T, _command: C): State<T, D, C> | null { return null; }
	pointDown(_context: T, _ev: g.PointDownEvent): void { /* nop */ }
	pointMove(_context: T, _ev: g.PointMoveEvent): void { /* nop */ }

}

export class StateManager<T, D, C> {
	state: State<T, D, C>;
	reservedState: State<T, D, C> | null;

	logger: Logger;

	private context: T;

	constructor(context: T, state?: State<T, D, C>, logger?: Logger) {
		this.context = context;
		this.state = state || new NullState<T, D, C>();
		this.reservedState = null;
		this.logger = logger || new Logger(false);

		this.logger.log(`Enter ${(this.state as any).constructor.name}`);
		this.state.enter(context);
	}

	update(): void {
		if (this.reservedState) {
			const state = this.reservedState;
			this.reservedState = null!;
			this.transition(state);
		}
		const next = this.state.update(this.context);
		if (next) {
			this.transition(next);
		}
	}

	/**
	 * ステートの切り替え。
	 *
	 * 次回の update() で実際の切り替えが行われる。
	 *
	 * @param state ステート。
	 */
	changeState(state: State<T, D, C>): void {
		this.reservedState = state;
	}

	command(command: C): void {
		const next = this.state.command(this.context, command);
		if (next) {
			this.transition(next);
		}
	}

	pointDown(ev: g.PointDownEvent): void {
		this.state.pointDown(this.context, ev);
	}

	pointMove(ev: g.PointMoveEvent): void {
		this.state.pointMove(this.context, ev);
	}

	private transition(next: State<T, D, C>): void {
		this.logger.log(`Leave ${(this.state as any).constructor.name}`);
		this.state.leave(this.context);

		this.state = next;

		this.logger.log(`Enter ${(this.state as any).constructor.name}`);
		this.state.enter(this.context);
	}
}

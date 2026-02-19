export interface State<T, D, C> {
	enter(context: T): void;
	update(context: T): State<T, D, C> | null;
	leave(context: T): void;
	command(context: T, command: C): State<T, D, C> | null;
	pointDown(context: T, ev: g.PointDownEvent): void;
	pointMove(context: T, ev: g.PointMoveEvent): void;
}

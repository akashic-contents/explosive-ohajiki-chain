import type { Vector2Like} from "../math";
import { Vec2 } from "../math";

export class Border {
	type: "border";

	invMass: 0;
	velocity: { x: 0, y: 0 };
	restitution: number;
	get position() {
		return this.points[0].clone().add(this.points[1]).scale(0.5);
	}

	betaScale: number;

	points: Vec2[];
	normal: Vec2;
	d: number;

	/** World が当たり判定を行わない組み合わせを扱うためのタグ。 */
	tag: string | undefined;

	userData: any;

	constructor(point1: Vector2Like, point2: Vector2Like) {
		this.type = "border";
		this.invMass = 0;
		this.velocity = { x: 0, y: 0 };
		this.restitution = 1;
		this.betaScale = 1;
		this.points = [
			new Vec2(point1),
			new Vec2(point2)
		];
		const p12 = this.points[1].clone().sub(this.points[0]);
		this.normal = p12.normalize().rotate(-Math.PI / 2);
		this.d = -this.normal.dot(this.points[0]);
	}
}

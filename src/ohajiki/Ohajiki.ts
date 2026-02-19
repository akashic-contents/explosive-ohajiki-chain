import type { Vector2Like } from "../math";
import { Vec2 } from "../math";

export interface OhajikiParameterObject {
	/** おはじきの質量。 0 の時、移動しない物体となる。 */
	mass: number;

	/** 初速度。 */
	velocity?: Vector2Like;

	/** 初期位置。 */
	position: Vector2Like;

	/** 半径。 */
	radius: number;

	/** 反発係数。 */
	restitution: number;

	/** 摩擦係数。 */
	mu: number;
}

export class Ohajiki {
	type: "ohajiki";

	invMass: number;
	velocity: Vec2;
	restitution: number;

	betaScale: number;

	mass: number;
	mu: number;
	radius: number;
	position: Vec2;

	/** World が当たり判定を行わない組み合わせを扱うためのタグ。 */
	tag: string | undefined;

	userData: unknown;

	constructor(param: OhajikiParameterObject) {
		this.type = "ohajiki";
		this.invMass = param.mass !== 0 ? 1 / param.mass : 0;
		this.velocity = new Vec2(param.velocity || Vec2.zero);
		this.restitution = param.restitution;
		this.betaScale = 1;
		this.mass = param.mass;
		this.mu = param.mu != null ? param.mu : 0.999999;
		this.radius = param.radius;
		this.position = new Vec2(param.position);
	}
}

import type { Vector2Like } from "../math";
import { Vec2 } from "../math";
import type { Ohajiki } from "./Ohajiki";
import type { Border } from "./Border";

export interface Contact {
	separation: number;
	normal: Vector2Like;
	point: Vector2Like;
	bias: number;
	mass: number;
}

export function collisionOhajikiVsOhajiki(bodyA: Ohajiki, bodyB: Ohajiki): Contact | null {
	const AB = new Vec2(
		bodyB.position.x - bodyA.position.x,
		bodyB.position.y - bodyA.position.y
	);
	const distance = AB.length();

	if (distance >= bodyA.radius + bodyB.radius) {
		return null;
	}

	const separation = distance - (bodyA.radius + bodyB.radius);
	const normal = distance !== 0 ? AB.scale(1 / distance) : new Vec2(1, 0);
	const point = normal.clone().scale(bodyA.radius + separation).add(bodyA.position);

	return {
		separation,
		normal,
		point,
		bias: 0,
		mass: 0
	};
}

export function collisionOhajikiVsBorder(bodyA: Ohajiki, bodyB: Border): Contact | null {
	const distance = bodyB.normal.dot(bodyA.position) + bodyB.d;

	if (distance >= bodyA.radius) {
		return null;
	}

	if (distance <= -bodyA.radius) {
		return null;
	}

	const separation = distance - bodyA.radius;
	const normal = bodyB.normal.clone().scale(-1);
	const point = normal.clone().scale(bodyA.radius + separation).add(bodyA.position);

	return {
		separation,
		normal,
		point,
		bias: 0,
		mass: 0
	};
}

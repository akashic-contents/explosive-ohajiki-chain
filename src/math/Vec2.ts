import type { Vector2Like } from "./Vector2Like";

export class Vec2 {
	static readonly zero: Vector2Like = { x: 0, y: 0 };

	static dot(v1: Vector2Like, v2: Vector2Like): number {
		return v1.x * v2.x + v1.y * v2.y;
	}

	static cross(v1: Vector2Like, v2: Vector2Like): number {
		return v1.x * v2.y - v1.y * v2.x;
	}

	x: number;
	y: number;

	constructor(xOrVector2Like?: number | Vector2Like, y: number = 0) {
		if (typeof xOrVector2Like === "number") {
			this.x = xOrVector2Like;
			this.y = y;
		} else {
			const v = xOrVector2Like || Vec2.zero;
			this.x = v.x;
			this.y = v.y;
		}
	}

	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	equal(other: Vector2Like): boolean {
		return this.x === other.x && this.y === other.y;
	}

	add(other: Vector2Like): Vec2 {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	sub(other: Vector2Like): Vec2 {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	scale(value: number): Vec2 {
		this.x *= value;
		this.y *= value;
		return this;
	}

	dot(other: Vector2Like): number {
		return this.x * other.x + this.y * other.y;
	}

	cross(other: Vector2Like): number {
		return this.x * other.y - this.y * other.x;
	}

	squaredLength(): number {
		return this.x * this.x + this.y * this.y;
	}

	length(): number {
		return Math.sqrt(this.squaredLength());
	}

	normalize(): Vec2 {
		const len = this.length() || 1;
		this.x /= len;
		this.y /= len;
		return this;
	}

	rotate(angle: number): Vec2 {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		const x = c * this.x - s * this.y;
		const y = s * this.x + c * this.y;

		this.x = x;
		this.y = y;

		return this;
	}
}

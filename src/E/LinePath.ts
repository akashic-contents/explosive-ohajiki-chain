import type { Vector2Like } from "../math";
import { Vec2 } from "../math";

export interface LinePathParameterObject extends g.EParameterObject {
	points?: Vector2Like[];
	thickness?: number;
	cssColor?: string;
}

export class LinePath extends g.E {
	points: Vector2Like[];
	thickness: number;
	cssColor: string;

	constructor(param: LinePathParameterObject) {
		super(param);
		this.points = param.points || [];
		this.thickness = param.thickness != null ? param.thickness : 1;
		this.cssColor = param.cssColor || "black";
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		const dy = -Math.round(this.thickness / 2);

		for (let i = 0; i < this.points.length - 1; i++) {
			const p1 = this.points[i];
			const p2 = this.points[i + 1];
			const p12 = new Vec2({ x: p2.x - p1.x, y: p2.y - p1.y });
			const n12 = p12.clone().normalize();
			const length = p12.length();

			renderer.save();
			renderer.transform([
				n12.x, n12.y,
				-n12.y, n12.x,
				p1.x, p1.y
			]);
			renderer.fillRect(0, dy, length, this.thickness, this.cssColor);
			renderer.restore();
		}

		return true;
	}
}

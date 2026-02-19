import type { Vector2Like } from "../math";
import { Vec2 } from "../math";
import { LinePath } from "./LinePath";

export interface StrikeArrowParameterObject extends g.EParameterObject {
	normalColor: string;
	maxColor: string;
	centerPosition: Vector2Like;
	tailPosition: Vector2Like;
	impulseScale: number;
	impulseMax: number;
}

export class StrikeArrow extends g.E {
	normalColor: string;
	maxColor: string;
	centerPosition: Vec2;
	tailPosition: Vec2;
	impulseScale: number;
	impulseMax: number;

	get direction() {
		return this.centerPosition.clone().sub(this.tailPosition);
	}

	get impulse() {
		const impulseMag = Math.min(
			this.direction.length() * this.impulseScale,
			this.impulseMax
		);
		return this.direction.clone().normalize().scale(impulseMag);
	}

	private line: LinePath;

	constructor(param: StrikeArrowParameterObject) {
		super(param);

		this.normalColor = param.normalColor;
		this.maxColor = param.maxColor;
		this.centerPosition = new Vec2(param.centerPosition);
		this.tailPosition = new Vec2(param.tailPosition);
		this.impulseScale = param.impulseScale;
		this.impulseMax = param.impulseMax;

		this.line = new LinePath({
			scene: param.scene,
			points: [ {x: 0, y: 0}, {x: 0, y: 0} ],
			thickness: 8,
			cssColor: param.normalColor
		});

		this.updateLinePoiints();

		this.append(this.line);
	}

	modified(): void {
		this.updateLinePoiints();

		const direction = this.centerPosition.clone().sub(this.tailPosition);

		this.line.cssColor = direction.length() * this.impulseScale <= this.impulseMax ? this.normalColor : this.maxColor;
		this.line.modified();

		super.modified();
	}

	destroy(): void {
		if (this.destroyed()) {
			return;
		}

		this.line.destroy();

		super.destroy();
	}

	private updateLinePoiints(): void {
		this.line.points[0] = this.centerPosition.clone().sub(this.tailPosition).scale(2).add(this.tailPosition);
		this.line.points[1] = this.tailPosition.clone();
	}
}

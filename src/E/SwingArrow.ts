import { Vec2 } from "../math";

export interface SwingArrowParameterObject extends g.EParameterObject {
	arrowImageAsset: g.ImageAsset;
	baseImageAsset: g.ImageAsset;
	abusoluteAngularVecolity: number;
	maxAngle: number;
	timeLimitInMilliSec: number;
}

function sign(n: number): number {
	return n >= 0 ? 1 : -1;
}

export class SwingArrow extends g.E {
	abusoluteAngularVelocity: number;
	maxAngle: number;
	timeLimitInMilliSec: number;

	theta: number;
	angularVecolity: number;

	private arrowSurface: g.Surface;
	private baseSurface: g.Surface;
	private timeRemainingInMilliSec: number;

	constructor(param: SwingArrowParameterObject) {
		super(param);

		this.abusoluteAngularVelocity = param.abusoluteAngularVecolity;
		this.maxAngle = param.maxAngle;
		this.timeLimitInMilliSec = param.timeLimitInMilliSec;
		this.theta = 0;
		this.angularVecolity = this.abusoluteAngularVelocity / g.game.fps;
		this.arrowSurface = param.arrowImageAsset.asSurface();
		this.baseSurface = param.baseImageAsset.asSurface();
		this.timeRemainingInMilliSec = 0;
		this.resetTimer();

		// strike button が更新する。
		// this.update.add(() => { this.onUpdate(); });
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		renderer.save();

		const c = Math.cos(this.theta);
		const s = Math.sin(this.theta);

		renderer.transform([
			c, s,
			-s, c,
			0, 0
		]);

		renderer.save();

		renderer.translate(0, -this.baseSurface.height / 2);

		renderer.drawImage(
			this.baseSurface,
			0, 0,
			this.baseSurface.width, this.baseSurface.height,
			0, 0
		);
		renderer.restore();

		renderer.translate(-this.arrowSurface.width - 58, -this.arrowSurface.height / 2);

		renderer.drawImage(
			this.arrowSurface,
			0, 0,
			this.arrowSurface.width, this.arrowSurface.height,
			0, 0
		);

		renderer.restore();

		renderer.save();

		const padding = 16;
		const barWidth = 128;
		const barHeight = 16;
		const borderWidth = 2;
		const borderHeight = 2;
		const redBarWidth = barWidth - borderWidth * 2;
		const redBarHeight = barHeight - borderHeight * 2;
		const t = this.timerProgressRate();
		const redBarLength = redBarWidth * t;

		renderer.translate(-barWidth / 2, this.baseSurface.height / 2 + padding);

		renderer.fillRect(0, 0, barWidth, barHeight, "black");

		renderer.translate(borderWidth, borderHeight);

		renderer.fillRect(
			0, 0,
			redBarLength, redBarHeight,
			"red"
		);

		renderer.fillRect(
			redBarLength, 0,
			redBarWidth - redBarLength, redBarHeight,
			"gray"
		);

		renderer.restore();

		return true;
	}

	/**
	 * 投石方向を得る。
	 */
	getDirection(): Vec2 {
		// 画像が最初から左向きを想定しているデザイン、つまり180度回転している
		// ので、表示上の角度に Pi を加算する。
		const th = this.theta + Math.PI;
		return new Vec2(Math.cos(th), Math.sin(th));
	}

	resetTimer(): void {
		this.timeRemainingInMilliSec = this.timeLimitInMilliSec;
	}

	timerProgressRate(): number {
		return this.timeRemainingInMilliSec / this.timeLimitInMilliSec;
	}

	calc(): void {
		this.theta += this.angularVecolity;
		this.timeRemainingInMilliSec = Math.max(
			this.timeRemainingInMilliSec - Math.round(1000 / g.game.fps),
			0
		);

		if (Math.abs(this.theta) >= this.maxAngle) {
			this.theta = this.maxAngle * sign(this.theta);
			this.angularVecolity *= -1;
		}
	}
}

import type { Vector2Like } from "../math";

/**
 *
 */
export interface LevelClearCutinEParameterObject extends g.EParameterObject {
	numAdditionalStone: number;
	numberImageAssets: g.ImageAsset[];
	stoneImageAsset: g.ImageAsset;
	clearMessageImageAsset: g.ImageAsset;
	stoneMessageImageAsset: g.ImageAsset;
	additionMessageImageAsset: g.ImageAsset;
}

/**
 *
 */
export class LevelClearCutinE extends g.E {
	numAdditionalStone: number;

	private numberSurfaces: g.Surface[];
	private stoneSurface: g.Surface;
	private clearMessageSurface: g.Surface;
	private stoneMessageSurface: g.Surface;
	private additionMessageSurface: g.Surface;

	constructor(param: LevelClearCutinEParameterObject) {
		super(param);
		this.numAdditionalStone = param.numAdditionalStone;
		this.numberSurfaces = param.numberImageAssets.map(asset => asset.asSurface());
		this.stoneSurface = param.stoneImageAsset.asSurface();
		this.clearMessageSurface = param.clearMessageImageAsset.asSurface();
		this.stoneMessageSurface = param.stoneMessageImageAsset.asSurface();
		this.additionMessageSurface = param.additionMessageImageAsset.asSurface();
	}

	/**
	 * おはじき追加演出開始位置。
	 */
	ohajikiPosition(): Vector2Like {
		const totalWidth = this.calcAdditionalStoneMessageWidth();

		const x = (g.game.width - totalWidth) / 2;

		return {
			x: x + this.stoneMessageSurface.width,
			y: 376
		};
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		renderer.save();

		renderer.opacity(0xB3 / 0xFF);

		renderer.fillRect(0, 0, g.game.width, g.game.height, "#00123F");

		renderer.restore();

		renderer.save();

		renderer.opacity(0xFF / 0xFF);

		renderer.fillRect(0, 285, g.game.width, 150, "#00123F");

		renderer.restore();

		renderer.save();

		renderer.translate(476, 297);

		renderer.drawImage(
			this.clearMessageSurface,
			0, 0,
			this.clearMessageSurface.width, this.clearMessageSurface.height,
			0, 0
		);

		renderer.restore();

		renderer.save();

		const totalWidth = this.calcAdditionalStoneMessageWidth();

		renderer.translate((g.game.width - totalWidth) / 2, 376);

		renderer.drawImage(
			this.stoneMessageSurface,
			0, 0,
			this.stoneMessageSurface.width, this.stoneMessageSurface.height,
			0, 0
		);

		renderer.translate(this.stoneMessageSurface.width, 0);

		renderer.drawImage(
			this.stoneSurface,
			0, 0,
			this.stoneSurface.width, this.stoneSurface.height,
			0, 0
		);

		renderer.translate(this.stoneSurface.width, 0);

		this.drawNum(renderer, camera);

		renderer.drawImage(
			this.additionMessageSurface,
			0, 0,
			this.additionMessageSurface.width, this.additionMessageSurface.height,
			0, 0
		);

		renderer.restore();

		return true;
	}

	private calcAdditionalStoneMessageWidth(): number {
		let totalWidth = 0;

		totalWidth += this.stoneMessageSurface.width;
		totalWidth += this.stoneSurface.width;
		totalWidth += this.numberSurfaces[0].width * (this.numAdditionalStone + "").length;
		totalWidth += this.additionMessageSurface.width;

		return totalWidth;
	}

	private drawNum(renderer: g.Renderer, _camera?: g.Camera): void {
		const numChars = (this.numAdditionalStone + "").split("");

		numChars.forEach(ch => {
			const n = parseInt(ch, 10);
			const surface = this.numberSurfaces[n];
			renderer.drawImage(
				surface,
				0, 0,
				surface.width, surface.height,
				0, 0
			);
			renderer.translate(surface.width, 0);
		});
	}
}

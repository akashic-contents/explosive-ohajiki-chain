/**
 *
 */
export interface LevelStartCutinEParameterObject extends g.EParameterObject {
	worldId: number;
	areaId: number;
	currentLevelIdx: number;
	universeSize: number;
	remianNorma: number;
	normalMarkImageAsset: g.ImageAsset;
	currentMarkImageAsset: g.ImageAsset;
	completeMarkImageAsset: g.ImageAsset;
	lineImageAsset: g.ImageAsset;
}

/**
 *
 */
export class LevelStartCutinE extends g.E {
	/** 現在のワールドID。 */
	worldId: number;

	/** 現在のエリアID。 */
	areaId: number;

	/** 全世界を通してのレベルインデックス。 */
	currentLevelIdx: number;

	/** 全世界の大きさ。全世界に含まれるレベルの数。 */
	universeSize: number;

	/** 残りノルマ。 */
	remianNorma: number;

	private normalMarkSurface: g.Surface;
	private currentMarkSurface: g.Surface;
	private completeMarkSurface: g.Surface;
	private lineSurface: g.Surface;
	private font: g.Font;
	private label: g.Label;

	constructor(param: LevelStartCutinEParameterObject) {
		super(param);

		this.worldId = param.worldId;
		this.areaId = param.areaId;
		this.currentLevelIdx = param.currentLevelIdx;
		this.universeSize = param.universeSize;
		this.remianNorma = param.remianNorma;

		this.normalMarkSurface = param.normalMarkImageAsset.asSurface();
		this.currentMarkSurface = param.currentMarkImageAsset.asSurface();
		this.completeMarkSurface = param.completeMarkImageAsset.asSurface();
		this.lineSurface = param.lineImageAsset.asSurface();

		this.font = new g.DynamicFont({
			game: g.game,
			fontFamily: "monospace",
			fontColor: "white",
			size: 48
		});

		this.label = new g.Label({
			scene: param.scene,
			text: `レベル ${this.worldId + 1}-${this.areaId + 1}   ノルマあと${this.remianNorma}個`,
			font: this.font,
			fontSize: this.font.size
		});
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

		const x = (g.game.width - this.label.width) / 2;

		renderer.translate(x, 302);

		this.label.render(renderer, camera);

		renderer.restore();

		this.renderMark(renderer, camera);

		return true;
	}

	private renderMark(renderer: g.Renderer, _camera?: g.Camera): void {
		const numMark = this.universeSize;
		const padding = 14;
		const lineLength = (numMark - 1) * (this.normalMarkSurface.width + padding);
		const markX = (g.game.width - (numMark * (this.normalMarkSurface.width + padding))) / 2;

		renderer.save();

		renderer.translate(markX, 385);

		if (lineLength > 0) {
			renderer.save();

			renderer.transform([
				lineLength / this.lineSurface.width, 0,
				0, 1,
				this.normalMarkSurface.width / 2,
				this.normalMarkSurface.height / 2 - this.lineSurface.height / 2
			]);

			renderer.drawImage(
				this.lineSurface,
				0, 0,
				this.lineSurface.width, this.lineSurface.height,
				0, 0
			);

			renderer.restore();
		}

		for (let i = 0; i < numMark; i++) {
			const surface =
				i < this.currentLevelIdx ?
					this.completeMarkSurface :
					i === this.currentLevelIdx ?
						this.currentMarkSurface :
						this.normalMarkSurface;
			renderer.drawImage(
				surface,
				0, 0,
				surface.width, surface.height,
				0, 0
			);
			renderer.translate(surface.width + padding, 0);
		}

		renderer.restore();
	}
}

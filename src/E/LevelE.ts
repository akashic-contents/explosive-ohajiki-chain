import type { Difficulty } from "../types";

export interface DifficultyImageAssets {
	easy: g.ImageAsset;
	normal: g.ImageAsset;
	hard: g.ImageAsset;
	crazy: g.ImageAsset;
}

export interface LevelEParameterObject extends g.EParameterObject {
	worldId?: number;
	areaId?: number;
	difficulty?: Difficulty;
	difficultyImageAssets: DifficultyImageAssets;
	numberImageAssets: g.ImageAsset[];
	hyphenImageAsset: g.ImageAsset;
}

export class LevelE extends g.E {
	worldId: number;
	areaId: number;

	get difficulty() {
		return this._difficulty;
	}
	set difficulty(v: Difficulty) {
		this._difficulty = v;
		this.difficultySurface = this.difficultyImageAssets[v].asSurface();
		this.modified();
	}

	private _difficulty: Difficulty;

	private difficultyImageAssets: DifficultyImageAssets;

	private difficultySurface: g.Surface | null;
	private numberSurfaces: g.Surface[];
	private hyphenSurface: g.Surface;

	constructor(param: LevelEParameterObject) {
		super(param);

		this.worldId = param.worldId != null ? param.worldId : 0;
		this.areaId = param.areaId != null ? param.areaId : 0;
		this.difficultyImageAssets = param.difficultyImageAssets;
		this._difficulty = "normal";  // setterを通さず初期化
		this.difficultySurface = null;
		this.difficulty = param.difficulty || "normal";
		this.numberSurfaces = param.numberImageAssets.map(asset => asset.asSurface());
		this.hyphenSurface = param.hyphenImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		if (this.difficultySurface == null) {
			return false;
		}

		const wholeWidth = this.width; // very hard の文字幅。
		const levelWidth = this.hyphenSurface.width + this.numberSurfaces[0].width * 2;
		const paddingY = 7;
		const worldNumSurface = this.numberSurfaces[this.worldId + 1];
		const areaNumSurface = this.numberSurfaces[this.areaId + 1];

		//
		// 難易度の描画。
		//

		renderer.save();

		renderer.translate(Math.round((wholeWidth - this.difficultySurface.width) / 2), 0);

		renderer.drawImage(
			this.difficultySurface,
			0, 0,
			this.difficultySurface.width, this.difficultySurface.height,
			0, 0
		);

		renderer.restore();

		//
		// レベルの描画。
		//

		renderer.save();

		renderer.translate(
			Math.round((wholeWidth - levelWidth) / 2),
			this.difficultySurface.height + paddingY
		);

		renderer.drawImage(
			worldNumSurface,
			0, 0,
			worldNumSurface.width, worldNumSurface.height,
			0, 0
		);

		renderer.translate(worldNumSurface.width, 0);

		renderer.drawImage(
			this.hyphenSurface,
			0, 0,
			this.hyphenSurface.width, this.hyphenSurface.height,
			0, 0
		);

		renderer.translate(this.hyphenSurface.width, 0);

		renderer.drawImage(
			areaNumSurface,
			0, 0,
			areaNumSurface.width, areaNumSurface.height,
			0, 0
		);

		renderer.restore();

		return true;
	}
}

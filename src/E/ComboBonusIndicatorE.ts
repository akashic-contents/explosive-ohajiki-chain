import type { Vector2Like } from "../math";

export interface ComboBonusIndicatorEParameterObject extends g.EParameterObject {
	count?: number;
	numberImageAssets: g.ImageAsset[];
	labelImageAsset: g.ImageAsset;
	equalImageAsset: g.ImageAsset;
	ohajikiImageAsset: g.ImageAsset;
}

export class ComboBonusIndicatorE extends g.E {
	get count() {
		return this._count;
	}
	set count(v: number) {
		v = Math.max(0, v);
		this._count = v;
		this.modified();
	}

	private static readonly OhajikiScale: number = 0.5;

	private _count: number;
	private numberSurfaces: g.Surface[];
	private labelSurface: g.Surface;
	private equalSurface: g.Surface;
	private ohajikiSurface: g.Surface;

	constructor(param: ComboBonusIndicatorEParameterObject) {
		super(param);

		this._count = 0;  // setterを通さず直接初期化
		this.count = param.count != null ? param.count : 0;
		this.numberSurfaces = param.numberImageAssets.map(asset => asset.asSurface());
		this.labelSurface = param.labelImageAsset.asSurface();
		this.equalSurface = param.equalImageAsset.asSurface();
		this.ohajikiSurface = param.ohajikiImageAsset.asSurface();
	}

	/**
	 * 透明おはじき座標。
	 *
	 * このインスタンスの座標からの相対座標である。
	 */
	ohajikiRelativePosition(): Vector2Like {
		return {
			x: this.labelSurface.width / 2 -
				this.equalSurface.width / 2 -
				this.ohajikiSurface.width * ComboBonusIndicatorE.OhajikiScale,
			y: this.labelSurface.height
		};
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		const ohajikiScaledWidth = this.ohajikiSurface.width * ComboBonusIndicatorE.OhajikiScale;

		renderer.save();

		renderer.drawImage(
			this.labelSurface,
			0, 0,
			this.labelSurface.width, this.labelSurface.height,
			0, 0
		);

		const ohajikiPosition = this.ohajikiRelativePosition();
		renderer.translate(ohajikiPosition.x, ohajikiPosition.y);

		renderer.save();

		renderer.transform([
			ComboBonusIndicatorE.OhajikiScale, 0,
			0, ComboBonusIndicatorE.OhajikiScale,
			0, 0
		]);

		renderer.drawImage(
			this.ohajikiSurface,
			0, 0,
			this.ohajikiSurface.width, this.ohajikiSurface.height,
			0, 0
		);

		renderer.restore();

		renderer.translate(ohajikiScaledWidth, 0);

		renderer.drawImage(
			this.equalSurface,
			0, 0,
			this.equalSurface.width, this.equalSurface.height,
			0, 0
		);

		renderer.translate(this.equalSurface.width, 0);

		const numberChars = (this.count + "").split("");

		numberChars.map(ch => parseInt(ch, 10)).forEach(idx => {
			const surface = this.numberSurfaces[idx];
			renderer.drawImage(
				surface,
				0, 0,
				surface.width, surface.height,
				0, 0
			);
			renderer.translate(surface.width, 0);
		});

		renderer.restore();

		return true;
	}
}

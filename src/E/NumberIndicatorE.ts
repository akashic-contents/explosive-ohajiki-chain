export interface NumberIndicatorEParameterObject extends g.EParameterObject {
	num?: number;
	inDanger?: boolean;
	maxIndicator: number;
	labelImageAsset: g.ImageAsset;
	indicatorImageAsset: g.ImageAsset;
	redIndicatorImageAsset?: g.ImageAsset;
	numberImageAssets: g.ImageAsset[];
	redNumberImageAssets?: g.ImageAsset[];
	minusImageAsset: g.ImageAsset;
	unitImageAsset: g.ImageAsset;
}

export class NumberIndicatorE extends g.E {
	num: number;
	maxIndicator: number;

	get inDanger() {
		return this._inDanger;
	}
	set inDanger(v: boolean) {
		this._inDanger = v;
		this.cntr = 0;
	}

	private labelSurface: g.Surface;
	private indicatorSurface: g.Surface;
	private redIndicatorSurface: g.Surface | null;
	private numberSurfaces: g.Surface[];
	private redNumberSurfaces: g.Surface[];
	private minusSurface: g.Surface;
	private unitSurface: g.Surface;
	private _inDanger: boolean;
	private cntr: number;

	constructor(param: NumberIndicatorEParameterObject) {
		super(param);

		this.num = param.num != null ? param.num : 0;
		this.maxIndicator = param.maxIndicator;
		this._inDanger = false;
		this.cntr = 0;
		this.inDanger = !!param.inDanger;

		this.labelSurface = param.labelImageAsset.asSurface();
		this.indicatorSurface = param.indicatorImageAsset.asSurface();
		this.redIndicatorSurface = param.redIndicatorImageAsset ? param.redIndicatorImageAsset.asSurface() : null;
		this.numberSurfaces = [];
		param.numberImageAssets.forEach(asset => {
			this.numberSurfaces.push(asset.asSurface());
		});
		this.redNumberSurfaces = [];
		if (param.redNumberImageAssets) {
			param.redNumberImageAssets.forEach(asset => {
				this.redNumberSurfaces.push(asset.asSurface());
			});
		}
		this.minusSurface = param.minusImageAsset.asSurface();
		this.unitSurface = param.unitImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		this.cntr++;

		// ラベルを縦方向にセンタリングするために、次の値を描画領域全体の高さとする。
		const height = this.numberSurfaces[0].height;

		renderer.save();

		//
		// ラベルの表示。
		//

		renderer.drawImage(
			this.labelSurface,
			0, 0,
			this.labelSurface.width, this.labelSurface.height,
			0, Math.round((height - this.labelSurface.height) / 2)
		);

		renderer.translate(this.labelSurface.width + 10, 0);

		//
		// インジケータの表示。
		//

		// インジケータ表示数。
		const numIndicator = Math.max(0, Math.min(this.num, this.maxIndicator));

		for (let i = 0; i < numIndicator; i++) {
			const x = Math.floor(i / 2) * this.indicatorSurface.width;
			const y = (i % 2) * this.indicatorSurface.height;
			renderer.save();
			renderer.translate(x, y);
			renderer.drawImage(
				this.indicatorSurface,
				0, 0,
				this.indicatorSurface.width, this.indicatorSurface.height,
				0, 0
			);
			if (this.inDanger && this.redIndicatorSurface) {
				const s = this.cntr / g.game.fps;
				const t = ((Math.sin(Math.PI * 2 * s)) + 1) / 2;
				renderer.opacity(t);
				renderer.drawImage(
					this.redIndicatorSurface,
					0, 0,
					this.redIndicatorSurface.width, this.redIndicatorSurface.height,
					0, 0
				);
			}
			renderer.restore();
		}

		if (numIndicator > 0) {
			renderer.translate(
				this.indicatorSurface.width * Math.ceil(numIndicator / 2) + 10,
				0
			);
		}

		//
		// 数字の表示。
		//

		if (this.num < 0) {
			renderer.drawImage(
				this.minusSurface,
				0, 0,
				this.minusSurface.width, this.minusSurface.height,
				0, 0
			);
			renderer.translate(this.minusSurface.width, 0);
		}

		(Math.abs(this.num) + "")
			.split("")
			.map(ch => parseInt(ch, 10))
			.forEach(n => {
				const surface = this.inDanger ?
					(this.redNumberSurfaces[n] || this.numberSurfaces[n]) :
					this.numberSurfaces[n];
				renderer.drawImage(
					surface,
					0, 0,
					surface.width, surface.height,
					0, 0
				);
				renderer.translate(surface.width, 0);
			});

		renderer.drawImage(
			this.unitSurface,
			0, 0,
			this.unitSurface.width, this.unitSurface.height,
			0, 0
		);

		renderer.restore();

		return true;
	}
}

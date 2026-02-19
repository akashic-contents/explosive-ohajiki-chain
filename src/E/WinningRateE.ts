export interface WinningRateEParameterObject extends g.EParameterObject {
	rate?: number;
	baseImageAsset: g.ImageAsset;
	numberImageAssets: g.ImageAsset[];
	percentImageAsset: g.ImageAsset;
	lowerImageAsset: g.ImageAsset;
}

export class WinningRateE extends g.E {
	rate: number;

	private baseSurface: g.Surface;
	private numberSurfaces: g.Surface[];
	private percentSurface: g.Surface;
	private lowerSurface: g.Surface;

	constructor(param: WinningRateEParameterObject) {
		super(param);

		this.rate = param.rate != null ? param.rate : 0;
		this.baseSurface = param.baseImageAsset.asSurface();
		this.numberSurfaces = param.numberImageAssets.map(asset => asset.asSurface());
		this.percentSurface = param.percentImageAsset.asSurface();
		this.lowerSurface = param.lowerImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		renderer.save();

		renderer.drawImage(
			this.baseSurface,
			0, 0,
			this.baseSurface.width, this.baseSurface.height,
			0, 0
		);

		if (this.rate < 1) {
			const textWidth =
				this.numberSurfaces[1].width +
				this.percentSurface.width +
				this.lowerSurface.width;

			renderer.translate((this.baseSurface.width - textWidth) / 2, 44);

			renderer.drawImage(
				this.numberSurfaces[1],
				0, 0,
				this.numberSurfaces[1].width, this.numberSurfaces[1].height,
				0, 0
			);

			renderer.translate(this.numberSurfaces[1].width, 0);

			renderer.save();

			renderer.translate(0, this.numberSurfaces[0].height - this.percentSurface.height);

			renderer.drawImage(
				this.percentSurface,
				0, 0,
				this.percentSurface.width, this.percentSurface.height,
				0, 0
			);

			renderer.restore();

			renderer.translate(this.percentSurface.width, 0);

			renderer.drawImage(
				this.lowerSurface,
				0, 0,
				this.lowerSurface.width, this.lowerSurface.height,
				0, 0
			);

		} else {
			const rate = Math.round(this.rate);
			const rateChars = (rate + "").split("");
			const textWidth =
				this.numberSurfaces[0].width * rateChars.length +
				this.percentSurface.width;

			renderer.translate((this.baseSurface.width - textWidth) / 2, 44);

			rateChars.forEach(ch => {
				const idx = parseInt(ch, 10);
				const surface = this.numberSurfaces[idx];
				renderer.drawImage(
					surface,
					0, 0,
					surface.width, surface.height,
					0, 0
				);
				renderer.translate(surface.width, 0);
			});

			renderer.translate(0, this.numberSurfaces[0].height - this.percentSurface.height);

			renderer.drawImage(
				this.percentSurface,
				0, 0,
				this.percentSurface.width, this.percentSurface.height,
				0, 0
			);
		}

		renderer.restore();

		return true;
	}
}

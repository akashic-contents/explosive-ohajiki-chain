export interface OhajikiEParameterObject extends g.EParameterObject {
	life: number;
	flash?: boolean;
	shake?: boolean;
	numberImageAssets: g.ImageAsset[];
	bodyImageAssets: g.ImageAsset[];
	flashImageAsset: g.ImageAsset;
	iceImageAsset?: g.ImageAsset;
}

export class OhajikiE extends g.E {
	get shake() {
		return this._shake;
	}
	set shake(v: boolean) {
		this._shake = v;
		this.modified();
	}

	get life() {
		return this._life;
	}
	set life(v: number) {
		this._life = v;
		this.modified();
	}

	get flash() {
		return this._flash;
	}
	set flash(v: boolean) {
		this._flash = v;
		if (v) {
			this.flashCntr = 3;
		}
		this.modified();
	}

	private _shake: boolean;
	private _life: number;
	private _flash: boolean;
	private flashCntr: number;

	private numberSurfaces: g.Surface[];
	private bodySurfaces: g.Surface[];
	private iceSurface: g.Surface | null;
	private flashSurface: g.Surface;

	constructor(param: OhajikiEParameterObject) {
		super(param);

		this._life = param.life;
		this._flash = !!param.flash;
		this._shake = !!param.flash;
		this.flashCntr = 0;

		this.numberSurfaces = param.numberImageAssets.map(asset => asset.asSurface());
		this.bodySurfaces = param.bodyImageAssets.map(asset => asset.asSurface());
		this.iceSurface = param.iceImageAsset ? param.iceImageAsset.asSurface() : null;
		this.flashSurface = param.flashImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		renderer.save();

		if (this.shake) {
			const dx = (g.game.random.generate() * 2 - 1) * 4;
			const dy = (g.game.random.generate() * 2 - 1) * 4;
			renderer.translate(dx, dy);
		}

		if (this.flash) {
			this.drawFlash(renderer, camera);
			this.flashCntr = Math.max(0, this.flashCntr - 1);
			if (this.flashCntr === 0) {
				this._flash = false;
			}
		} else {
			this.drawBody(renderer, camera);
			this.drawIce(renderer, camera);
			this.drawLife(renderer, camera);
		}

		renderer.restore();

		return true;
	}

	private drawFlash(renderer: g.Renderer, _camera?: g.Camera): void {
		renderer.save();

		renderer.translate(
			-this.flashSurface.width / 2,
			-this.flashSurface.height / 2
		);

		renderer.drawImage(
			this.flashSurface,
			0, 0,
			this.flashSurface.width, this.flashSurface.height,
			0, 0
		);

		renderer.restore();
	}

	private drawBody(renderer: g.Renderer, _camera?: g.Camera): void {
		// ライフについて、以下の２つの値の範囲でおはじきの色を選択する。
		const lifeLowerThreshold = 1;
		const lifeUpperThreshold = 10;

		// bodySurface は ライフの低い方から高い方へ並んでいる。
		let bodySurface: g.Surface;
		if (this.bodySurfaces.length < 3) { // 透明石はバリエーションがないので、これも妥当。
			bodySurface = this.bodySurfaces[0];
		} else {
			if (this._life <= lifeLowerThreshold) {
				bodySurface = this.bodySurfaces[0];
			} else if (this._life < lifeUpperThreshold) {
				const lifeRangeSize = lifeUpperThreshold - lifeLowerThreshold;
				const bodyVariationNum = this.bodySurfaces.length - 2;
				const t = (this._life - lifeLowerThreshold) / lifeRangeSize;
				const idx = Math.round(bodyVariationNum * t) + 1;
				bodySurface = this.bodySurfaces[idx];
			} else {
				bodySurface = this.bodySurfaces[this.bodySurfaces.length - 1];
			}
		}

		renderer.save();

		renderer.translate(
			-bodySurface.width / 2,
			-bodySurface.height / 2
		);

		renderer.drawImage(
			bodySurface,
			0, 0,
			bodySurface.width, bodySurface.height,
			0, 0
		);

		renderer.restore();
	}

	private drawIce(renderer: g.Renderer, _camera?: g.Camera): void {
		if (!this.iceSurface) {
			return;
		}

		renderer.save();

		renderer.translate(
			-this.iceSurface.width / 2,
			-this.iceSurface.height / 2
		);

		renderer.drawImage(
			this.iceSurface,
			0, 0,
			this.iceSurface.width, this.iceSurface.height,
			0, 0
		);

		renderer.restore();
	}

	/**
	 * ライフの描画。
	 *
	 * 中央揃え、最大３桁で３桁の時は２桁の幅にスケール。
	 *
	 * @param renderer
	 * @param camera
	 */
	private drawLife(renderer: g.Renderer, _camera?: g.Camera): void {
		renderer.save();

		const width = this.numberSurfaces[0].width; // 等幅と仮定している。
		const height = this.numberSurfaces[0].height;
		const numberChars = (this._life + "").split("");
		const scaleX = numberChars.length >= 3 ? 2 / numberChars.length : 1;
		const totalWidth = numberChars.length * width * scaleX;

		renderer.transform([
			scaleX, 0,
			0, 1,
			-totalWidth / 2, -height / 2
		]);

		for (let i = 0; i < numberChars.length; i++) {
			const ch = numberChars[i];
			const idx = parseInt(ch, 10);
			const surface = this.numberSurfaces[idx];
			renderer.drawImage(
				surface,
				0, 0,
				surface.width, surface.height,
				0, 0
			);
			renderer.translate(surface.width * scaleX, 0);
		}

		renderer.restore();
	}

	private createFlashSurface(shapeSurface: g.Surface): g.Surface {
		const renderTarget = g.game.resourceFactory.createSurface(shapeSurface.width, shapeSurface.height);

		const renderer = renderTarget.renderer();

		renderer.save();

		renderer.drawImage(
			shapeSurface,
			0, 0,
			shapeSurface.width, shapeSurface.height,
			0, 0
		);

		renderer.setCompositeOperation("source-atop");

		renderer.fillRect(0, 0, renderTarget.width, renderTarget.height, "white");

		renderer.restore();

		return renderTarget;
	}
}

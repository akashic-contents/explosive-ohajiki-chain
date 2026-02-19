export type PatchMode = "none" | "three" | "nine";

function drawPatch(renderer: g.Renderer, surface: g.Surface, width: number, height: number, patchMode: PatchMode, patchSize: number): void {
	if (patchMode === "none") {
		renderer.save();
		renderer.transform([
			width / surface.width, 0,
			0, height / surface.height,
			0, 0
		]);
		renderer.drawImage(surface, 0, 0, surface.width, surface.height, 0, 0);
		renderer.restore();
	} else if (patchMode === "three") {
		// 左
		renderer.save();
		renderer.transform([
			1, 0,
			0, height / surface.height,
			0, 0
		]);
		renderer.drawImage(surface, 0, 0, patchSize, surface.height, 0, 0);
		renderer.restore();

		// 中央
		renderer.save();
		renderer.transform([
			(width - patchSize * 2) / (surface.width - patchSize * 2), 0,
			0, height / surface.height,
			patchSize, 0
		]);
		renderer.drawImage(surface, patchSize, 0, surface.width - patchSize * 2, surface.height, 0, 0);
		renderer.restore();

		// 右
		renderer.save();
		renderer.transform([
			1, 0,
			0, height / surface.height,
			width - patchSize, 0
		]);
		renderer.drawImage(surface, surface.width - patchSize, 0, patchSize, surface.height, 0, 0);
		renderer.restore();
	} else if (patchMode === "nine") {
		// Left Top
		renderer.drawImage(surface, 0, 0, patchSize, patchSize, 0, 0);
		// Right Top
		renderer.drawImage(surface, surface.width - patchSize, 0, patchSize, patchSize, width - patchSize, 0);
		// Left Bottom
		renderer.drawImage(surface, 0, surface.height - patchSize, patchSize, patchSize, 0, height - patchSize);
		// Right Bottom
		renderer.drawImage(
			surface, surface.width - patchSize, surface.height - patchSize, patchSize, patchSize, width - patchSize, height - patchSize);

		// Top
		renderer.save();
		renderer.transform([
			(width - patchSize * 2) / (surface.width - patchSize * 2), 0,
			0, 1,
			patchSize, 0
		]);
		renderer.drawImage(surface, patchSize, 0, surface.width - patchSize * 2, patchSize, 0, 0);
		renderer.restore();

		// Left
		renderer.save();
		renderer.transform([
			1, 0,
			0, (height - patchSize * 2) / (surface.height - patchSize * 2),
			0, patchSize
		]);
		renderer.drawImage(surface, 0, patchSize, patchSize, surface.height - patchSize * 2, 0, 0);
		renderer.restore();

		// Bottom
		renderer.save();
		renderer.transform([
			(width - patchSize * 2) / (surface.width - patchSize * 2), 0,
			0, 1,
			patchSize, height - patchSize
		]);
		renderer.drawImage(surface, patchSize, surface.height - patchSize, surface.width - patchSize * 2, patchSize, 0, 0);
		renderer.restore();

		// Right
		renderer.save();
		renderer.transform([
			1, 0,
			0, (height - patchSize * 2) / (surface.height - patchSize * 2),
			width - patchSize, patchSize
		]);
		renderer.drawImage(surface, surface.width - patchSize, patchSize, patchSize, surface.height - patchSize * 2, 0, 0);
		renderer.restore();

		// Center
		renderer.save();
		renderer.transform([
			(width - patchSize * 2) / (surface.width - patchSize * 2), 0,
			0, (height - patchSize * 2) / (surface.height - patchSize * 2),
			patchSize, patchSize
		]);
		renderer.drawImage(surface, patchSize, patchSize, surface.width - patchSize * 2, surface.height - patchSize * 2, 0, 0);
		renderer.restore();
	}
}

function drawSurfaceCenter(renderer: g.Renderer, surface: g.Surface, width: number, height: number): void {
	renderer.drawImage(
		surface,
		0, 0,
		surface.width, surface.height,
		(width - surface.width) / 2,
		(height - surface.height) / 2
	);
}

export interface FlashButtonEParameterObject extends g.CacheableEParameterObject {
	active?: boolean;
	activeButtonImage: g.ImageAsset;
	inactiveButtonImage?: g.ImageAsset;
	activeLabelImage: g.ImageAsset;
	inactiveLabelImage?: g.ImageAsset;
	patchMode?: PatchMode;
	patchSize?: number;
}

/**
 * フラッシュボタン。
 *
 * 以下の演出機能を持つ。
 *
 * - ボタンを白くフラッシュする。
 * - ボタンとラベルの組みを別の組みとフェードしつつ切り替える。
 *
 * これらの演出の実行はユーザコードの責務である。
 *
 * ボタン用画像は width, height の大きさに拡大される。拡大方法 は PatchMode で指定できる。
 *
 */
export class FlashButtonE extends g.CacheableE {
	flashPeak: g.Trigger<void>;
	flashed: g.Trigger<void>;

	private activeButtonSurface: g.Surface;
	private inactiveButtonSurface: g.Surface;
	private activeLabelSurface: g.Surface;
	private inactiveLabelSurface: g.Surface;
	private patchMode: "none" | "three" | "nine";
	private patchSize: number;

	private buttonSurface: g.Surface;
	private labelSurface: g.Surface;

	private flashing: boolean;
	private flashCntr: number;
	private flashIntensity: number;

	private crossfading: boolean;
	private crossfadeCntr: number;
	private crossfadeDuration: number;
	private crossfadeValue: number;
	private nextButtonSurface: g.Surface | null;
	private nextLabelSurface: g.Surface | null;

	constructor(param: FlashButtonEParameterObject) {
		super(param);

		param.active = param.active == null ? true : param.active;

		this.activeButtonSurface = param.activeButtonImage.asSurface();
		this.inactiveButtonSurface = param.inactiveButtonImage
			? param.inactiveButtonImage.asSurface()
			: param.activeButtonImage.asSurface();
		this.activeLabelSurface = param.activeLabelImage.asSurface();
		this.inactiveLabelSurface = param.inactiveLabelImage ? param.inactiveLabelImage.asSurface() : param.activeLabelImage.asSurface();
		this.patchMode = param.patchMode != null ? param.patchMode : "none";
		this.patchSize = param.patchSize != null ? param.patchSize : 0;

		this.buttonSurface = param.active ? this.activeButtonSurface : this.inactiveButtonSurface;
		this.labelSurface = param.active ? this.activeLabelSurface : this.inactiveLabelSurface;

		this.flashIntensity = 0;
		this.flashCntr = 0;
		this.flashing = false;
		this.flashPeak = new g.Trigger<void>();
		this.flashed = new g.Trigger<void>();

		this.crossfading = false;
		this.crossfadeCntr = 0;
		this.crossfadeDuration = 0;
		this.crossfadeValue = 0;
		this.nextButtonSurface = null;
		this.nextLabelSurface = null;

		this.onUpdate.add(() => this.handleUpdate());
	}

	renderCache(renderer: g.Renderer, _camera?: g.Camera): void {
		if (!this.crossfading) {
			// ボタン描画。
			drawPatch(renderer, this.buttonSurface, this.width, this.height, this.patchMode, this.patchSize);
			// ラベル描画。
			drawSurfaceCenter(renderer, this.labelSurface, this.width, this.height);
		} else {
			// ２つのボタン画像をクロスフェードするとボタン全体が半透明になるので、元のボタンはそのままに、次のボタン画像をフェードインさせる。
			if (!this.nextButtonSurface || !this.nextLabelSurface) {
				return;
			}
			renderer.save();
			drawPatch(renderer, this.buttonSurface, this.width, this.height, this.patchMode, this.patchSize);
			renderer.opacity(this.crossfadeValue);
			drawPatch(renderer, this.nextButtonSurface, this.width, this.height, this.patchMode, this.patchSize);
			renderer.restore();

			// ラベルはクロスフェードする。

			// 元のラベルを徐々に消す
			renderer.save();
			renderer.opacity(1 - this.crossfadeValue);
			drawSurfaceCenter(renderer, this.labelSurface, this.width, this.height);
			renderer.restore();

			// 次のラベルを徐々に出す。
			renderer.save();
			renderer.opacity(this.crossfadeValue);
			drawSurfaceCenter(renderer, this.nextLabelSurface, this.width, this.height);
			renderer.restore();
		}

		if (this.flashIntensity > 0) {
			renderer.save();
			renderer.setCompositeOperation("source-atop");
			renderer.opacity(this.flashIntensity);
			renderer.fillRect(0, 0, this.width, this.height, "white");
			renderer.restore();
		}
	}

	/**
	 * フラッシュする演出の開始。
	 */
	startFlash(): void {
		this.flashing = true;
		this.flashCntr = 0;
		this.flashIntensity = 0;
	}

	/**
	 * フラッシュする演出のキャンセル。
	 */
	cancelFlash(): void {
		this.flashing = false;
		this.flashCntr = 0;
		this.flashIntensity = 0;
	}

	/**
	 * ボタンとラベルの画像をフェードしつつ切り替える演出の開始。
	 */
	startCrossfade(duration?: number): void {
		this.crossfading = true;
		this.crossfadeCntr = 0;
		this.crossfadeDuration = duration != null ? duration : Math.round(g.game.fps / 2);

		if (this.buttonSurface === this.activeButtonSurface) {
			this.nextButtonSurface = this.inactiveButtonSurface;
			this.nextLabelSurface = this.inactiveLabelSurface;
		} else {
			this.nextButtonSurface = this.activeButtonSurface;
			this.nextLabelSurface = this.activeLabelSurface;
		}
	}

	/**
	 * ボタンとラベルの画像をフェードしつつ切り替える演出のキャンセル。
	 */
	cancelCrossFade(): void {
		this.crossfading = false;
		this.crossfadeCntr = 0;
	}

	private handleUpdate(): void {
		this.updateFlash();
		this.updateCrossfade();
	}

	private updateFlash(): void {
		if (!this.flashing) {
			return;
		}

		const duration = g.game.fps * 1;

		this.flashCntr++;

		// t: 0 -> 1 -> 0 と変化する値。
		const s = this.flashCntr / duration;
		const t = s * 2 <= 1 ? s * 2 : 2 - s * 2;
		this.flashIntensity = t;

		// t がピークに来るタイミング。
		if (this.flashCntr === Math.round(duration / 2)) {
			this.flashPeak.fire();
		}

		this.flashing = this.flashCntr < duration;

		if (!this.flashing) {
			this.flashed.fire();
		}

		this.invalidate();
	}

	private updateCrossfade(): void {
		if (!this.crossfading) {
			return;
		}

		if (this.crossfadeDuration > 0) {
			this.crossfadeCntr++;

			const t = this.crossfadeCntr / this.crossfadeDuration;

			this.crossfadeValue = t;

			this.crossfading = this.crossfadeCntr < this.crossfadeDuration;
		} else {
			// 即完了。
			this.crossfading = false;
		}

		if (!this.crossfading) {
			if (this.nextButtonSurface) {
				this.buttonSurface = this.nextButtonSurface;
			}
			if (this.nextLabelSurface) {
				this.labelSurface = this.nextLabelSurface;
			}
		}

		this.invalidate();
	}
}

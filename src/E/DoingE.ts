/**
 * Doing パラメタオブジェクト。
 */
export interface DoingEParameterObject extends g.EParameterObject {
	/** 任意の画像。 */
	body: g.ImageAsset;

	/** body の後ろに配置される画像。通常 "・" の画像用いる。 */
	dot: g.ImageAsset;

	/** dot パラメータで指定された画像を並べる最大数。 */
	maxDot?: number;

	/** dot パラメータで指定された画像が増減するアニメーションの長さ（秒）。 */
	duration?: number;
}

/**
 * Doing.
 *
 * "<画像>..." を表示するE。"..." の部分は時間とともに増減する。
 */
export class DoingE extends g.E {
	// 本文画像。
	bodySurface: g.Surface;

	// "・" 画像。
	dotSurface: g.Surface;

	// アニメーションしている時、真（読み取り専用）。
	animating: boolean;

	// ”・" が増減するアニメーションの長さ（秒）。
	duration: number;

	private dotPadding: number;

	private cntr: number;
	private numDot: number;
	private maxDot: number;

	constructor(param: DoingEParameterObject) {
		super(param);

		this.bodySurface = param.body.asSurface();
		this.dotSurface = param.dot.asSurface();

		this.dotPadding = 8;

		this.maxDot = param.maxDot ?? 3; // bug fixed
		this.width = this.bodySurface.width + (this.dotPadding + this.dotSurface.width) * this.maxDot;
		this.height = Math.max(this.bodySurface.height, this.dotSurface.height);

		this.cntr = 0;
		this.numDot = 0;
		this.animating = false;
		this.duration = param.duration != null ? param.duration : 2;

		this.onUpdate.add(() => this.handleUpdate());
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		renderer.drawImage(this.bodySurface, 0, 0, this.bodySurface.width, this.bodySurface.height, 0, 0);

		const y = (this.height - this.dotSurface.height) / 2; // "・" は中央揃えとしておく。
		let x = this.bodySurface.width + this.dotPadding;
		for (let i = 0; i < this.numDot; i++) {
			renderer.drawImage(this.dotSurface, 0, 0, this.dotSurface.width, this.dotSurface.height, x, y);
			x += this.dotSurface.width + this.dotPadding;
		}

		return true;
	}

	start(): void {
		this.cntr = 0;
		this.numDot = 0;
		this.animating = true;
	}

	stop(): void {
		this.animating = false;
	}

	reset(): void {
		this.cntr = 0;
		this.numDot = 0;
		this.animating = false;
	}

	private handleUpdate(): void {
		if (!this.animating) {
			return;
		}

		this.cntr++;

		const durationInFrame = Math.round(g.game.fps * this.duration);
		const t = (this.cntr % durationInFrame) / durationInFrame; // [0, 1)

		this.numDot = Math.floor(t * (this.maxDot + 1));

		this.modified();
	}
}

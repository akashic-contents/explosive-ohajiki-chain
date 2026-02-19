/**
 * スローモーション用タイムマネージャ。
 *
 * ゲーム世界更新の際の経過時間を管理する。
 * 通常これは 1 / g.game.fps [sec] である。
 *
 * 一般化すればスローモーションだけでなくも早送りも扱えるが、ここでは
 * 指定された実時間の間ゲーム世界をスローモーションにするのための時間管理役、
 * として実装している。
 */
export class TimeManager {
	/** スローモーション継続時間。 */
	duration: number;

	/** スローモーション開始からのupdate呼び出し回数。 */
	cntr: number;

	/** スローモーションの時、真。 参照専用。 */
	isSlowmo: boolean;

	/**
	 * タイムスケール。
	 *
	 * スローモーション中は (0, 1) の値、
	 * スローモーションでない時は 1 になる。
	 */
	get timeScale() {
		return this.isSlowmo ? this._timeScale : 1;
	}

	/**
	 * ゲーム世界更新に用いる経過時間（秒）。
	 */
	get dt() {
		return this.baseDt * this.timeScale;
	}

	/**
	 * 基本経過時間（秒）。
	 *
	 * 1 / g.game.fps に等しい。
	 */
	get baseDt() {
		return 1 / g.game.fps;
	}

	private _timeScale: number;

	/**
	 * コンストラクタ。
	 *
	 * @param timeScale スローモーション中のタイムスケール。
	 * @param duration スローモーション期間の長さ。
	 */
	constructor(timeScale: number, duration: number) {
		this._timeScale = timeScale;
		this.duration = duration;
		this.isSlowmo = false;
		this.cntr = 0;
	}

	/**
	 * スローモーションの開始。
	 */
	startSlowmo(): void {
		this.cntr = 0;
		this.isSlowmo = true;
	}

	/**
	 * マネージャの更新。
	 */
	update(): void {
		if (this.isSlowmo) {
			this.cntr++;
			if (this.cntr >= this.duration) {
				this.isSlowmo = false;
			}
		}
	}
}

/**
 * 到達したレベルを表示するメッセージ。
 */
export interface ArrivalLevelMessage {
	worldId: number;
	areaId: number;
	numberImageAssets: g.ImageAsset[];
	hyphenImageAsset: g.ImageAsset;
	reachImageAsset: g.ImageAsset;
}

/**
 * リザルト表示コンストラクタパラメタ。
 */
export interface ResultWindowEParameterObject extends g.PaneParameterObject {
	/**
	 * 難易度イメージアセット。
	 */
	difficultyImageAsset: g.ImageAsset;

	/**
	 * メッセージ。
	 */
	message: ArrivalLevelMessage | g.ImageAsset;

	/**
	 * Nine-patchのボーダー幅。
	 */
	borderWidth?: number | g.CommonRect;
}

function messageTypeGuard(param: ArrivalLevelMessage | g.ImageAsset): param is ArrivalLevelMessage {
	return (param as ArrivalLevelMessage).worldId !== undefined;
}

/**
 * リザルト表示。
 */
export class ResultWindowE extends g.Pane {
	borderWidth: number | g.CommonRect | null;

	constructor(param: ResultWindowEParameterObject) {
		super(param);

		this.borderWidth = param.borderWidth ?? null;

		const difficultySpr = new g.Sprite({
			scene: param.scene,
			src: param.difficultyImageAsset,
			x: (this.width - param.difficultyImageAsset.width) / 2,
			y: 36
		});

		const messageE = messageTypeGuard(param.message)
			? this.createArrivalLevelMessage(param.message)
			: this.createImageMessage(param.message);

		this.append(difficultySpr);
		this.append(messageE);
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		const borderWidth = this.borderWidth;

		if (!borderWidth) {
			return true;
		}

		const surface = g.SurfaceUtil.asSurface(this.backgroundImage);

		if (!surface) {
			return true;
		}

		g.SurfaceUtil.renderNinePatch(renderer, this.width, this.height, surface, borderWidth);

		return true;
	}

	private createImageMessage(messageImageAsset: g.ImageAsset): g.E {
		const messageSpr = new g.Sprite({
			scene: this.scene,
			src: messageImageAsset,
			y: 106
		});

		messageSpr.x = (this.width - messageImageAsset.width) / 2;
		messageSpr.modified();

		return messageSpr;
	}

	private createArrivalLevelMessage(param: ArrivalLevelMessage): g.E {
		const scene = this.scene;

		const reachRoot = new g.E({ scene });
		const y = 106;
		let x = 0;

		("" + (param.worldId + 1)).split("").forEach(ch => {
			const n = parseInt(ch, 10);
			const src = param.numberImageAssets[n];
			reachRoot.append(new g.Sprite({
				scene,
				src,
				x, y
			}));
			x += src.width;
		});

		reachRoot.append(new g.Sprite({
			scene,
			src: param.hyphenImageAsset,
			x, y
		}));
		x += param.hyphenImageAsset.width;

		("" + (param.areaId + 1)).split("").forEach(ch => {
			const n = parseInt(ch, 10);
			const src = param.numberImageAssets[n];
			reachRoot.append(new g.Sprite({
				scene,
				src,
				x, y
			}));
			x += src.width;
		});

		x += 30;

		reachRoot.append(new g.Sprite({
			scene,
			src: param.reachImageAsset,
			x, y
		}));
		x += param.reachImageAsset.width;

		reachRoot.x = (this.width - x) / 2;
		reachRoot.modified();

		return reachRoot;
	}
}

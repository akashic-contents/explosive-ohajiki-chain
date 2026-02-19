export interface HowToPlayEParameterObject extends g.PaneParameterObject {
	asobikataImageAsset: g.ImageAsset;
	pageNoImageAssets: g.ImageAsset[];

	textLines: string[][];
	font: g.Font;
	borderWidth?: number | g.CommonRect;
}

export interface HowToPlayEWithPageButtonParameterObject extends HowToPlayEParameterObject {
	leftButtonImageAsset: g.ImageAsset;
	rightButtonImageAsset: g.ImageAsset;
}

export class HowToPlayE extends g.Pane {

	/**
	 * ページ切り替えボタン付き how to play ウインドウの生成。
	 *
	 * ボタンが HowToPlayE からはみ出るレイアウトで g.Pane ははみ出した部分が
	 * 切り取られるため、単純にボタンを子要素にできない。そこで g.E を親としてその下に
	 * HowToPlayE とボタンを配置する。
	 */
	static createWithPageButton(param: HowToPlayEWithPageButtonParameterObject): g.E {
		const root = new g.E({
			scene: param.scene,
			x: param.x,
			y: param.y
		});

		param.x = 0;
		param.y = 0;
		const howToPlayE = new HowToPlayE(param);

		const leftBtn = new g.Sprite({
			scene: param.scene,
			src: param.leftButtonImageAsset,
			x: 0 - param.leftButtonImageAsset.width / 2,
			y: (param.height - param.leftButtonImageAsset.height) / 2,
			scaleX: -1,
			touchable: true
		});
		const rightBtn = new g.Sprite({
			scene: param.scene,
			src: param.rightButtonImageAsset,
			x: param.width - param.rightButtonImageAsset.width / 2,
			y: (param.height - param.rightButtonImageAsset.height) / 2,
			touchable: true
		});

		// 最初のページなので左に進めない。
		leftBtn.hide();

		leftBtn.onPointDown.add(() => {
			howToPlayE.goLeft();
			rightBtn.show();
			if (howToPlayE.pageNo === 0) {
				leftBtn.hide();
			}
		});

		rightBtn.onPointDown.add(() => {
			howToPlayE.goRight();
			leftBtn.show();
			if (howToPlayE.pageNo === howToPlayE.maxPageNo) {
				rightBtn.hide();
			}
		});

		root.append(howToPlayE);
		root.append(leftBtn);
		root.append(rightBtn);

		return root;
	}

	pageNo: number;
	pageRoots: g.E[];
	textLines: string[][];
	borderWidth: number | g.CommonRect | null;

	get maxPageNo() {
		return this.textLines ? this.textLines.length - 1 : 0;
	}

	constructor(param: HowToPlayEParameterObject) {
		super(param);

		this.pageNo = 0;
		this.pageRoots = [];
		this.textLines = param.textLines;
		this.borderWidth = param.borderWidth ?? null;

		const asobikata = new g.Sprite({
			scene: param.scene,
			src: param.asobikataImageAsset,
			x: 64,
			y: 34
		});
		this.append(asobikata);

		param.textLines.forEach((lines, idx) => {
			const pageRoot = new g.E({ scene: param.scene });

			const x = 64;
			let y = 78;
			const lineHeight = 176 / 4;
			for (let i = 0; i < lines.length; i++) {
				const text = lines[i];
				const line = new g.Label({
					scene: param.scene,
					font: param.font,
					fontSize: lineHeight * 0.8, // 34,
					text: text,
					textColor: "white",
					x: x,
					y: y
				});
				pageRoot.append(line);
				y += lineHeight;
			}

			if (idx < param.pageNoImageAssets.length) {
				const pageNoImageAsset = param.pageNoImageAssets[idx];
				const pageNoSpr = new g.Sprite({
					scene: param.scene,
					src: pageNoImageAsset,
					x: 64 + asobikata.width + 16,
					y: 34
				});
				pageRoot.append(pageNoSpr);
			}

			this.pageRoots.push(pageRoot);
			this.append(pageRoot);
		});

		this.showPage(this.pageNo);
	}

	goLeft(): void {
		this.goPage(this.pageNo - 1);
	}

	goRight(): void {
		this.goPage(this.pageNo + 1);
	}

	goPage(pageNo: number): void {
		this.pageNo = Math.max(0, Math.min(pageNo, this.textLines.length - 1));
		this.showPage(this.pageNo);
	}

	showPage(pageNo: number): void {
		for (let i = 0; i < this.pageRoots.length; i++) {
			const pageRoot = this.pageRoots[i];
			if (i !== pageNo) {
				pageRoot.hide();
			} else {
				pageRoot.show();
			}
		}
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
}

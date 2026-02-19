import * as utils from "../utils";

export interface MVPItemEParameterObject extends g.SpriteParameterObject {
	font: g.Font;
	titleImageAsset: g.ImageAsset;
	name: string;
	detailText: string;
}

/**
 * MVPアイテム。
 */
export class MVPItemE extends g.Sprite {
	constructor(param: MVPItemEParameterObject) {
		super(param);

		const titleSpr = new g.Sprite({
			scene: param.scene,
			src: param.titleImageAsset,
			x: 24,
			y: 22
		});

		const labelY = 13;

		const nameLabel = new g.Label({
			scene: param.scene,
			font: param.font,
			fontSize: 44,
			text: utils.limitTextByWidth(param.name, 380, param.font, 44, "..."),
			x: 343,
			y: labelY
		});

		const detailLabel = new g.Label({
			scene: param.scene,
			font: param.font,
			fontSize: 44,
			text: param.detailText,
			y: labelY
		});
		detailLabel.x = this.width - 24 - detailLabel.width;
		detailLabel.modified();

		this.append(titleSpr);
		this.append(nameLabel);
		this.append(detailLabel);
	}
}

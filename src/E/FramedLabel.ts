
import * as utils from "../utils";

export type HorizontalAlignment = "left" | "center" | "right";
export type VerticalAlignment = "top" | "center" | "bottom";

interface FrameParameterObject extends g.EParameterObject {
	horizontalAlignment: HorizontalAlignment;
	verticalAlignment: VerticalAlignment;
}

/**
 * 子要素を `width, height` の矩形の中で位置合わせする E 。
 *
 * 最初の child だけが alignment の計算に用いられている。また、回転拡大縮小は考慮されていない。
 */
export class Frame extends g.E {
	horizontalAlignment: HorizontalAlignment;
	verticalAlignment: VerticalAlignment;

	constructor(param: FrameParameterObject) {
		super(param);
		this.horizontalAlignment = param.horizontalAlignment;
		this.verticalAlignment = param.verticalAlignment;
	}

	setAlignment(horizontal: HorizontalAlignment, vertical: VerticalAlignment): void {
		this.setHorizontalAlighment(horizontal);
		this.setVerticalAlignment(vertical);
	}

	setHorizontalAlighment(alighment: HorizontalAlignment): void {
		const e = this.children?.[0];
		if (!e) {
			return;
		}
		this.horizontalAlignment = alighment;
		if (alighment === "left") {
			e.x = 0;
		} else if (alighment === "center") {
			e.x = (this.width - e.width) / 2;
		} else {
			e.x = this.width - e.width;
		}
		e.modified();
	}

	setVerticalAlignment(alighment: VerticalAlignment): void {
		const e = this.children?.[0];
		if (!e) {
			return;
		}
		this.verticalAlignment = alighment;
		if (alighment === "top") {
			e.y = 0;
		} else if (alighment === "center") {
			e.y = (this.height - e.height) / 2;
		} else {
			e.y = this.height - e.height;
		}
		e.modified();
	}

	protected applyAlignment(): void {
		this.setAlignment(this.horizontalAlignment, this.verticalAlignment);
	}
}

export interface FramedLabelParameterObject extends FrameParameterObject {
	labelParam: g.LabelParameterObject;
	textMaxWidth?: number;
}

/**
 * ラベルを矩形の中に配置するラベル。
 */
export class FramedLabel extends Frame {
	label: g.Label;
	textMaxWidth: number | null;

	constructor(param: FramedLabelParameterObject) {
		super(param);
		this.textMaxWidth = param.textMaxWidth ?? null;
		if (this.textMaxWidth != null) {
			const text = param.labelParam.text;
			const font = param.labelParam.font;
			const fontSize = param.labelParam.fontSize ?? 1;
			param.labelParam.text = utils.limitTextByWidth(text, this.textMaxWidth, font, fontSize, "...");
		}
		this.label = new g.Label(param.labelParam);
		this.append(this.label);
		this.horizontalAlignment = param.horizontalAlignment;
		this.verticalAlignment = param.verticalAlignment;
		this.setAlignment(this.horizontalAlignment, this.verticalAlignment);
	}

	setText(text: string): void {
		if (this.textMaxWidth != null) {
			text = utils.limitTextByWidth(text, this.textMaxWidth, this.label.font, this.label.fontSize, "...");
		}
		this.label.text = text;
		this.label.invalidate();
		this.applyAlignment();
	}
}

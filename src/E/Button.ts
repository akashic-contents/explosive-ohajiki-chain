export interface ButtonParameterObject extends g.EParameterObject {
	cssColor: string;
	font: g.Font;
	text?: string;
}

export class Button extends g.E {

	set text(text: string) {
		if (this.label.text !== text) {
			this.label.text = text;
			this.label.invalidate();
			this.labelCentering();
		}
	}

	get text() {
		return this.label.text;
	}

	private body: g.FilledRect;
	private label: g.Label;

	constructor(param: ButtonParameterObject) {
		param.touchable = true;

		super(param);

		this.body = new g.FilledRect({
			scene: this.scene,
			width: this.width,
			height: this.height,
			cssColor: param.cssColor
		});

		this.label = new g.Label({
			scene: this.scene,
			font: param.font,
			text: param.text || "",
			fontSize: Math.floor(this.height * 0.8),
			textColor: "white"
		});
		this.labelCentering();

		this.append(this.body);
		this.body.append(this.label);

		const offset = 4;

		this.onPointDown.add(_ev => {
			this.body.x += offset;
			this.body.y += offset;
			this.body.modified();
		});
		this.onPointUp.add(_ev => {
			this.body.x -= offset;
			this.body.y -= offset;
			this.body.modified();
		});
	}

	private labelCentering(): void {
		this.label.x = (this.body.width - this.label.width) / 2;
		this.label.y = (this.body.height - this.label.height) / 2;
		this.label.modified();
	}

}

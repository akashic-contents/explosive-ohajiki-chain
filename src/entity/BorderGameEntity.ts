import { BaseGameEntity } from "./BaseGameEntity";
import type { Border } from "../ohajiki";

export class BorderGameEntity extends BaseGameEntity {
	border: Border;

	constructor(border: Border) {
		super();
		this.type = "border";
		this.border = border;
		this.border.userData = this;
	}
}

import * as tl from "@akashic-extension/akashic-timeline";
import * as utils from "../utils";
import * as audio from "../audio";
import type { System } from "../System";
import type { OhajikiState } from "./OhajikiState";
import { BaseState } from "./BaseState";
import type { OhajikiCommand } from "../coeMessages";
import { ResultState } from "./ResultState";
import { AllGameClearCutinE } from "../E";

export class GameClearState extends BaseState {
	private nextState: OhajikiState | null;
	private timeline!: tl.Timeline;

	constructor() {
		super();
		this.nextState = null;
	}

	enter(system: System): void {
		this.nextState = null;
		this.timeline = new tl.Timeline(system.scene);

		this.setupUI(system);
	}

	update(_system: System): OhajikiState | null {
		return this.nextState;
	}

	leave(_system: System): void {
		this.timeline.destroy();
	}

	command(context: System, command: OhajikiCommand): OhajikiState | null {
		let next: OhajikiState | null = null;

		if (command.type === "go-result") {
			this.timeline.completeAll();
			next = new ResultState({
				difficulty: command.difficulty,
				worldId: command.worldId,
				areaId: command.areaId,
				gameClear: true,
				niceAward: command.niceAward,
				comboAward: command.comboAward,
				narrowEscapeAward: command.narrowEscapeAward
			});
		}

		return next;
	}

	private setupUI(system: System): void {
		const scene = system.scene;
		const tween = this.timeline.create({});

		tween
			.call(() => {
				const cutin = new AllGameClearCutinE({
					scene,
					messageImageAsset: scene.asset.getImage("/assets/ui/cutin/cut_in_text04.png"),
					opacity: 0
				});
				scene.append(cutin);
				const cutinTween = this.timeline.create(cutin);
				cutinTween
					.fadeIn(150)
					.call(() => audio.playbackSE("/assets/common/se/jingle/game_end"))
					.wait(3000)
					.fadeOut(150)
					.call(() => cutin.destroy());
			})
			.wait(150 + 3000 + 150);

		if (g.game.isActiveInstance()) {
			tween
				.call(() => utils.sendGoResult(system));
		}
	}
}

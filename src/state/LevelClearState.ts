import * as tl from "@akashic-extension/akashic-timeline";
import * as common from "./common";
import * as audio from "../audio";
import type { System } from "../System";
import type { OhajikiState } from "./OhajikiState";
import { BaseState } from "./BaseState";
import type { OhajikiCommand } from "../coeMessages";
import { LevelStartState } from "./LevelStartState";
import { LevelClearCutinE } from "../E";
import type { Vector2Like } from "../math";

/**
 * レベルを進行し投石可能な状態にするステート。
 */
export class LevelClearState extends BaseState {
	private noStrikeClear: boolean;

	private font!: g.Font;
	private timeline!: tl.Timeline;

	constructor(noStrikeClear: boolean) {
		super();
		this.noStrikeClear = noStrikeClear;
	}

	enter(system: System): void {
		this.font = new g.DynamicFont({
			game: g.game,
			fontFamily: "monospace",
			size: 36
		});

		this.timeline = new tl.Timeline(system.scene);

		this.setupSequence(system);
	}

	update(_system: System): OhajikiState | null {
		return null;
	}

	leave(_system: System): void {
		this.timeline.destroy();
		this.font.destroy();
	}

	command(system: System, command: OhajikiCommand): OhajikiState | null {
		let nextState: OhajikiState | null = null;

		// NOTE: wind する必要のない（してはいけない）コマンドは早期リターンすること。
		if (command.type === "add-player") {
			common.handleAddPlayerCommand(system, command);
			return nextState;
		}

		this.timeline.completeAll();

		if (command.type === "start-game") {
			nextState = new LevelStartState({
				withTutorial: false,
				changePlayer: !this.noStrikeClear,
				mode: "go-next"
			});
		}

		return nextState;
	}

	/**
	 * シーケンスの準備。
	 */
	private setupSequence(context: System): void {
		const scene = context.scene;
		const tween = this.timeline.create({});

		const numberImageAssets: g.ImageAsset[] = [];
		for (let i = 0; i < 10; i++) {
			numberImageAssets.push(scene.asset.getImage("/assets/common/numbers/stageNum_0" + i + ".png"));
		}

		const nextLevel = context.getNextLevelConfig();
		const numAwardOhajikis = nextLevel ? nextLevel.numAwardOhajikis : 0;
		const waitDuration = 250;
		const flyingDuratoin = 500;
		const delay = (numAwardOhajikis - 1) * waitDuration + flyingDuratoin;
		let ohajikiPosition: Vector2Like;

		const ohajikiEs: g.E[] = [];

		tween
			.call(() => {
				const cutin = new LevelClearCutinE({
					scene,
					numAdditionalStone: numAwardOhajikis,
					numberImageAssets,
					stoneImageAsset: scene.asset.getImage("/assets/ui/cutin/icon_ball.png"),
					clearMessageImageAsset: scene.asset.getImage("/assets/ui/cutin/cut_in_text02.png"),
					stoneMessageImageAsset: scene.asset.getImage("/assets/ui/cutin/cut_in_text03_stone.png"),
					additionMessageImageAsset: scene.asset.getImage("/assets/ui/cutin/cut_in_text03_add.png"),
					opacity: 0
				});
				scene.append(cutin);

				ohajikiPosition = cutin.ohajikiPosition();

				const cutinTween = this.timeline.create(cutin);

				cutinTween
					.fadeIn(150)
					.call(() => audio.playbackSE("/assets/common/se/jingle/stage_end"))
					.wait(3000)
					.call(() => {
						for (let i = 0; i < numAwardOhajikis; i++) {
							const spr = new g.Sprite({
								scene,
								src: scene.asset.getImage("/assets/ui/cutin/icon_ball.png"),
							});
							const ohajiki = new g.E({
								scene,
								x: ohajikiPosition.x,
								y: ohajikiPosition.y
							});
							ohajiki.append(spr);
							context.effectLayer.append(ohajiki);
							ohajikiEs.push(ohajiki);
						}
					})
					.fadeOut(150)
					.call(() => cutin.destroy());
			})
			.wait(150 + 3000 + 150)
			.call(() => {
				ohajikiEs.forEach((ohajiki, i) => {
					const ohajikiTween = this.timeline.create(ohajiki);
					ohajikiTween
						.wait(i * waitDuration)
						.moveTo(834 + 72 / 2, 28 + 36 / 2, flyingDuratoin, tl.Easing.easeInOutExpo)
						.con()
						.fadeOut(flyingDuratoin, tl.Easing.easeInCubic)
						.call(() => {
							context.numStrikesRemaining++;
							ohajiki.destroy();
						});
				});
			});

		// ohajikiTween 完了待ち。
		tween.wait(delay + 1000);

		if (g.game.isActiveInstance()) {
			tween.call(() => context.scene.send({ type: "start-game" }));
		}
	}
}

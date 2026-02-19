import type { Vector2Like } from "../math";
import { Vec2 } from "../math";
import type { ExplosionParam, Appearance } from "./BaseGameEntity";
import { BaseGameEntity } from "./BaseGameEntity";
import type { OhajikiParameterObject , World } from "../ohajiki";
import { Ohajiki } from "../ohajiki";
import type { Trail, TrailNode } from "../E";
import type { OhajikiE } from "../E";
import type { Logger } from "../Logger";
import type { System } from "../System";
import { createOhajikiE } from "../game-common";

export interface HitStopParam {
	impulse: Vector2Like;
}

interface HitStopInernalData {
	param?: HitStopParam;
	mass: number;
	invMass: number;
}

interface OhajikiTrailNode extends TrailNode {
	length: number;
	dt: number;
}

export interface SerializedOhajikiGameEntity {
	type: string;
	position: Vector2Like;
	life: number;
	damageSources: string[];
	receiveBlastDamage: boolean;

	appearance: Appearance;

	ohajikiParam: OhajikiParameterObject;

	blastRadius: number;
	blastImpulse: number;
	normaDecrease: number;
	countExplosion: boolean;
}

export interface OhajikiGameEntityParameterObject {
	type: string;
	position: Vector2Like;
	life: number;
	damageSources: string[];
	receiveBlastDamage: boolean;

	appearance: Appearance;

	root: g.E | g.Scene;
	hidden: boolean;

	system: System;
	world: World;
	ohajikiParam: OhajikiParameterObject;

	// strikeParam?: StrikeParameterObject;

	blastRadius: number;
	blastImpulse: number;
	normaDecrease: number;
	countExplosion: boolean;

	logger: Logger;
}

export class OhajikiGameEntity extends BaseGameEntity {
	accumDamage: number;
	damageSources: string[];
	receiveBlastDamage: boolean;
	dead: boolean;
	striked: boolean;
	blastHitCount: number;

	appearance: Appearance;

	enableTrail: boolean;
	trail: Trail | null;
	trailShrinkDelayTimer: number;

	blastRadius: number;
	blastImpulse: number;

	ohajiki: Ohajiki;
	world: World;
	system: System;

	root: g.E | g.Scene;
	ohajikiE: OhajikiE;

	logger: Logger;

	get suspended() {
		return !!this.hitStopInternalData;
	}

	private timerId: g.TimerIdentifier | null;
	private blastHitCntr: number;
	private hitStopInternalData: HitStopInernalData | null;

	constructor(param: OhajikiGameEntityParameterObject) {
		super();

		this.type = param.type;
		this.world = param.world;
		this.system = param.system;

		this.accumDamage = 0;
		this.damageSources = param.damageSources;
		this.receiveBlastDamage = param.receiveBlastDamage;

		this.dead = false;

		this.striked = false;

		this.enableTrail = true;
		this.trail = null;
		this.trailShrinkDelayTimer = 0;

		this.blastRadius = param.blastRadius;
		this.blastImpulse = param.blastImpulse;
		this.normaDecrease = param.normaDecrease;
		this.countExplosion = param.countExplosion;
		this.blastHitCount = 0;
		this.blastHitCntr = 0;
		this.timerId = null;
		this.hitStopInternalData = null;

		this.appearance = param.appearance;

		this.root = param.root;
		this.logger = param.logger;

		const ohajiki = new Ohajiki(param.ohajikiParam);
		ohajiki.userData = this;

		const ohajikiE = createOhajikiE(
			this.system.scene,
			param.appearance,
			ohajiki.invMass === 0,
			param.life,
			ohajiki.position,
			param.hidden
		);

		this.ohajiki = ohajiki;
		this.ohajikiE = ohajikiE;

		this.hitStopInternalData = null;
	}

	onUpdate(): void {
		const oldPosition = new Vec2(this.ohajikiE);
		const newPosition = this.ohajiki.position.clone();

		// ヒットストップが有効になる直前に位置が更新されている可能性がある。
		this.ohajikiE.x = this.ohajiki.position.x;
		this.ohajikiE.y = this.ohajiki.position.y;
		this.ohajikiE.modified();

		this.updateTrail(newPosition, oldPosition);

		if (!this.suspended) {
			this.ohajikiE.shake = false;
		}

		if (this.suspended && !this.system.timeManager.isSlowmo) {
			this.resume();
		}

		if (this.dead) {
			this.destroy();
			return;
		}
	}

	onRegistered(): void {
		this.root.append(this.ohajikiE);
		this.world.ohajikis.push(this.ohajiki);
	}

	onDestroy(): void {
		if (this.timerId) {
			this.system.scene.clearTimeout(this.timerId);
			this.timerId = null;
		}
		if (this.ohajikiE) {
			this.ohajikiE.destroy();
			this.ohajikiE = null!;
		}
		if (this.ohajiki) {
			this.world.removeOhajiki(this.ohajiki);
			this.ohajiki = null!;
		}
		if (this.trail) {
			this.system.trailRenderer.removeTrail(this.trail);
			this.trail = null;
		}
	}

	willDie(): boolean {
		return this.ohajikiE.life > 0 && this.ohajikiE.life - this.accumDamage <= 0;
	}

	addDamage(source: BaseGameEntity): void {
		if (this.damageSources.indexOf(source.type) !== -1) {
			this.accumDamage++;

			// フラッシュするのはダメージがあった時。
			this.ohajikiE.flash = true;
		}
	}

	updateLife(): boolean {
		if (this.accumDamage > 0 && this.ohajikiE.life > 0) {
			if (this.accumDamage > 1) {
				this.logger.log(`Large accumulated damage ${this.accumDamage}`);
			}

			this.ohajikiE.life = Math.max(0, this.ohajikiE.life - this.accumDamage);

			this.dead = this.ohajikiE.life === 0;
			return this.dead;
		}
		return false;
	}

	clearDamage(): void {
		this.accumDamage = 0;
	}

	addBlastDamage(damage: number): void {
		if (!this.receiveBlastDamage) {
			return;
		}

		if (this.blastHitCount === 0) {
			this.blastHitCntr = 0;
		}

		this.blastHitCount += damage;
	}

	updateTrail(newPosition: Vec2, oldPosition: Vec2): void {
		const trailRenderer = this.system.trailRenderer;

		if (!this.enableTrail) {
			if (this.trail) {
				trailRenderer.removeTrail(this.trail);
				this.trail = null;
			}
			this.trailShrinkDelayTimer = 0;
			return;
		}

		const trailConfig = this.system.config.trail;
		const trailNodeLifeSpanInFrame = trailConfig.nodeLifeSpanInFrame;
		const trailOccurenceSpeed = trailConfig.occurrenceSpeed;
		const trailMaxLength = trailConfig.maxLength;
		const trailLengthScale = trailConfig.lengthScale;

		const timeManager = this.system.timeManager;
		let dt = timeManager.dt;
		const baseDt = timeManager.baseDt;

		// trailOccurenceSpeed が固定タイムステップでの値のため。
		const speed = newPosition.clone().sub(oldPosition).length() / dt * baseDt;

		// トレイル発生。
		if (!this.trail) {
			if (speed < trailOccurenceSpeed) {
				return;
			}

			const nodes: OhajikiTrailNode[] = [
				{
					position: newPosition,
					length: oldPosition.clone().sub(newPosition).length(),
					dt
				},
				{
					position: oldPosition,
					length: 0,
					dt: 0
				}
			];

			this.trail = {
				nodes,
				startWidth: this.ohajiki.radius * 2,
				maxLength: trailMaxLength,
				lengthScale: trailLengthScale
			};

			trailRenderer.addTrail(this.trail);

			this.trailShrinkDelayTimer = trailNodeLifeSpanInFrame * baseDt;

			return;
		}

		// トレイル伸縮。

		const nodes = this.trail.nodes as OhajikiTrailNode[];

		const dx = new Vec2(nodes[0].position).sub(newPosition);

		// トレイル成長。
		const newNode: OhajikiTrailNode = {
			position: newPosition,
			length: dx.length(),
			dt
		};

		nodes.unshift(newNode);

		if (this.trailShrinkDelayTimer > 0) {
			this.trailShrinkDelayTimer -= dt;
			return;
		}

		// トレイル欠落。

		for (let i = nodes.length - 2; i >= 0; i--) {
			const frontNode = nodes[i];
			const backNode = nodes[i + 1];

			if (frontNode.dt <= dt) {
				nodes.pop();
				dt -= frontNode.dt;
			} else {
				const direction = new Vec2(backNode.position).sub(frontNode.position);
				direction.scale(1 - dt / frontNode.dt);
				backNode.position = new Vec2(frontNode.position).clone().add(direction);
				frontNode.dt -= dt;
				dt = 0;
			}

			if (dt <= 0) {
				break;
			}
		}

		if (nodes.length <= 1) { // トレイル削除。
			trailRenderer.removeTrail(this.trail);
			this.trail = null;
		}
	}

	createExplosionParam(): ExplosionParam {
		return {
			position: this.ohajiki.position.clone(),
			radius: this.blastRadius,
			impulse: this.blastImpulse,
			blastDamage: this.system.config.general.blastDamage,
			sources: [this],
			appearance: this.appearance
		};
	}

	/**
	 * 爆風ダメージ処理。
	 *
	 * 爆風からダメージを受ける性質のおはじきではない時、何もしない。
	 */
	updateBlastDamage(): void {
		if (!this.receiveBlastDamage || this.blastHitCount === 0) {
			return;
		}

		const interval = Math.round(g.game.fps * 0.25);

		if (this.blastHitCntr % interval === 0) {
			this.accumDamage++;
			this.blastHitCount--;
		}

		this.blastHitCntr++;
	}

	suspend(param?: HitStopParam): void {
		if (!this.hitStopInternalData) {
			this.hitStopInternalData = {
				mass: this.ohajiki.mass,
				invMass: this.ohajiki.invMass
			};
			this.ohajiki.mass = 0;
			this.ohajiki.invMass = 0;
			this.ohajiki.velocity.x = 0;
			this.ohajiki.velocity.y = 0;
		}

		this.hitStopInternalData.param = param;
	}

	resume(): void {
		if (!this.hitStopInternalData) {
			return;
		}

		this.ohajiki.mass = this.hitStopInternalData.mass;
		this.ohajiki.invMass = this.hitStopInternalData.invMass;

		if (this.hitStopInternalData.param) {
			const param = this.hitStopInternalData.param;
			this.ohajiki.velocity.x = param.impulse.x * this.ohajiki.invMass;
			this.ohajiki.velocity.y = param.impulse.y * this.ohajiki.invMass;
		}

		this.hitStopInternalData = null;
	}

	serialize(): SerializedOhajikiGameEntity {
		return {
			type: this.type,
			position: { x: this.ohajikiE.x, y: this.ohajikiE.y },
			life: this.ohajikiE.life,
			damageSources: this.damageSources,
			receiveBlastDamage: this.receiveBlastDamage,
			appearance: this.appearance,
			ohajikiParam: {
				mass: this.ohajiki.mass,
				position: undefined as any, // 送信しない。
				radius: this.ohajiki.radius,
				restitution: this.ohajiki.restitution,
				mu: this.ohajiki.mu
			},
			blastRadius: this.blastRadius,
			blastImpulse: this.blastImpulse,
			normaDecrease: this.normaDecrease,
			countExplosion: this.countExplosion
		};
	}
}

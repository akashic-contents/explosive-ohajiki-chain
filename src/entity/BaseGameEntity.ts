import type { GameEntity, EntityManager } from "../entity-system-2";
import type { Vector2Like } from "../math";

export type Appearance = "normal" | "big" | "crystal";

export interface ExplosionParam {
	position: Vector2Like;
	radius: number;
	impulse: number;
	blastDamage: number;
	sources: BaseGameEntity[];
	appearance: Appearance;
}

/**
 * 爆発連鎖おはじき用基底エンティティ。
 */
export class BaseGameEntity implements GameEntity {
	/** Entityの種別。damageSource によるダメージ判定に用いる。 */
	type!: string;

	/** 破壊時のノルマ減少量。 */
	normaDecrease: number;

	/** 真の時、破壊時爆発カウントに計上する。 */
	countExplosion: boolean;

	private manager: EntityManager<BaseGameEntity> | null;

	private _destroyed: boolean;

	constructor() {
		this.manager = null;
		this._destroyed = false;
		this.normaDecrease = 0;
		this.countExplosion = true;
	}

	update(): void {
		this.onUpdate();
	}

	destroy(): void {
		if (this._destroyed) {
			return;
		}

		this.onDestroy();
		this.manager?.unRegister(this);

		this._destroyed = true;
	}

	destroyed(): boolean {
		return this._destroyed;
	}

	register(manager: EntityManager<BaseGameEntity>): void {
		this.manager = manager;
		this.onRegistered();
	}

	unRegister(): void {
		this.onUnregistered();
	}

	onUpdate(): void { /* nop. */ }
	onDestroy(): void { /* nop. */ }
	onRegistered(): void { /* nop. */ }
	onUnregistered(): void { /* nop. */ }

	/**
	 * 接触によるダメージを与える。
	 *
	 * @param source このエンティティに接触したエンティティ。
	 */
	addDamage(_source: BaseGameEntity): void { /* nop. */ }

	/**
	 * 爆風ダメージ更新。
	 */
	updateBlastDamage(): void { /* nop. */ }

	/**
	 * 蓄積したダメージなどから破壊されることが決まっている時、真。
	 */
	willDie(): boolean { return false; }

	/**
	 * ダメージに応じてライフを更新する。
	 *
	 * ライフが０になった時、真を返す。
	 */
	updateLife(): boolean { return false; }

	/**
	 * ダメージのクリア。
	 */
	clearDamage(): void { /* nop. */ }

	/**
	 * 爆発パラメータを生成する。
	 *
	 * 爆発しないエンティティは null を返す。
	 */
	createExplosionParam(): ExplosionParam | null {
		return null;
	}

}

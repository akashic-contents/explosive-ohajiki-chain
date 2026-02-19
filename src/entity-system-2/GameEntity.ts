import type { EntityManager } from "./EntityManager";

export interface GameEntity {
	/** 更新。 */
	update(): void;

	/** 破棄。 */
	destroy(): void;

	/** 破棄されている時、真。 */
	destroyed(): boolean;

	/** マネージャへの登録。 マネージャが利用する。 */
	register(manager: EntityManager<GameEntity>): void;

	/** マネージャからの登録抹消。 マネージャが利用する。 */
	unRegister(): void;
}

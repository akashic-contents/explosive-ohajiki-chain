import type { GameEntity } from "./GameEntity";

export class EntityManager<T extends GameEntity> {
	entities: (T | null)[];

	constructor() {
		this.entities = [];
	}

	update(): void {
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i]?.update();
		}
	}

	flush(): void {
		this.entities = this.entities.filter(e => !!e);
	}

	register(entity: T): void {
		this.entities.push(entity);
		entity.register(this);
	}

	unRegister(entity: T): void {
		for (let i = 0; i < this.entities.length; i++) {
			if (this.entities[i] === entity) {
				this.entities[i] = null;
				return;
			}
		}
	}

	destroyAllEntities(): void {
		this.entities.forEach(entity => {
			if (entity) {
				entity.destroy();
				this.unRegister(entity);
			}
		});
	}
}

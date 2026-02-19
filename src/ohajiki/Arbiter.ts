import { Vec2 } from "../math";
import type { Ohajiki } from "./Ohajiki";
import type { Border } from "./Border";
import type { Contact} from "./Contact";
import { collisionOhajikiVsBorder, collisionOhajikiVsOhajiki } from "./Contact";

export class Arbiter {
	bodyA: Ohajiki;
	bodyB: Ohajiki | Border;
	contacts: Contact[];
	longevity: boolean;

	constructor(bodyA: Ohajiki, bodyB: Ohajiki | Border) {
		this.bodyA = bodyA;
		this.bodyB = bodyB;
		this.contacts = [];
		this.longevity = false;

		// 現在のところ contacs.length はたかだか 1 である。
		if (bodyB.type === "ohajiki") {
			const contact = collisionOhajikiVsOhajiki(bodyA, bodyB);
			if (contact) this.contacts.push(contact);
		} else {
			const contact = collisionOhajikiVsBorder(bodyA, bodyB);
			if (contact) this.contacts.push(contact);
		}
	}

	preStep(invDt: number): void {
		const baseBeta = 0.1;
		for (let i = 0; i < this.contacts.length; i++) {
			const contact = this.contacts[i];
			const beta = baseBeta * this.bodyA.betaScale * this.bodyB.betaScale;
			contact.bias = beta * invDt * (-contact.separation);
			const k = this.bodyA.invMass + this.bodyB.invMass;
			contact.mass = k !== 0 ? 1 / k : 0;
		}
	}

	applyImpulse(): void {
		for (let i = 0; i < this.contacts.length; i++) {
			const contact = this.contacts[i];
			if (contact.mass === 0) {
				continue;
			}

			const bodyA = this.bodyA;
			const bodyB = this.bodyB;
			const e = bodyA.restitution * bodyB.restitution;
			const pn = (
				bodyA.velocity.clone()
					.sub(bodyB.velocity)
					.dot(contact.normal)
				+
				contact.bias
				+
				bodyA.velocity.clone()
					.sub(bodyB.velocity)
					.dot(contact.normal) * e
			) * contact.mass;

			if (pn <= 0) {
				continue;
			}

			const impulse = new Vec2(contact.normal).scale(pn);

			// 回転を扱わないので contact.point の出番はない。
			// コリジョンのデバッグ（視覚化）の役に立つので省略しない。

			const dVA = impulse.clone().scale(bodyA.invMass);
			bodyA.velocity.sub(dVA);

			if (bodyB.type === "ohajiki") {
				const dVB = impulse.clone().scale(bodyB.invMass);
				bodyB.velocity.add(dVB);
			}
		}
	}
}

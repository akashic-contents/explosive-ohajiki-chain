import type { Configuration } from "./Configuration";

export interface GameMainParameterObject extends g.GameMainParameterObject {
	sessionParameter: {
		mode?: string;
		totalTimeLimit?: number;
		difficulty?: number;
		randomSeed?: number;
		playThreshold?: number;
		clearThreshold?: number;

		// おはじき独自の拡張。
		config?: Configuration;
	};
}

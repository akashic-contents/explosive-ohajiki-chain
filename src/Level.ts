export interface DeployedOhajiki {
	ohajikiId: string;
	num: number;
}

export interface Level {
	/** 目標石破壊数。 */
	norma: number;

	/** 報酬投石数。 */
	numAwardOhajikis: number;

	/** 配置する石の情報（種類と数）。 */
	deployedOhajikis: DeployedOhajiki[];

	/** 配置石総ライフ。 */
	deployedOhajikiTotalLife: number;
}

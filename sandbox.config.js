var config = {
	autoSendEventName: "myConfig",

	showMenu: false,

	events: {
		// event 'myConfig'
		myConfig: [
			[
				32,
				0,
				":akashic", {
					// セッションスタート
					"type": "start",
					// セッションパラメータ
					"parameters": {
						//セッションパラメータの breakout-multi 独自拡張部分。デフォルト設定を上書きする。
						"config": {
							"matching": {
								"receptionTimeInSec": 1,
							},

							"swingArrow": {
								"maxAngle": 70
							},

							"debug": {
								enableLog: true
							}
						}
					}
				}
			]
		]
	}
};

module.exports = config;

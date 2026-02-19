// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
global.g = require("@akashic/akashic-engine");

// utils のテスト用にインポート
const { assign } = require("../script/utils");

describe("utils.assign", () => {
	describe("array replacement", () => {
		it("should replace entire array instead of merging elements", () => {
			const target = { names: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] };
			const source = { names: ["X", "Y"] };

			const result = assign(target, source);

			// 配列は丸ごと置き換えられる（要素数も変わる）
			expect(result.names).toEqual(["X", "Y"]);
			expect(result.names.length).toBe(2);
		});

		it("should replace empty array with non-empty array", () => {
			const target = { items: [] };
			const source = { items: ["item1", "item2", "item3"] };

			const result = assign(target, source);

			expect(result.items).toEqual(["item1", "item2", "item3"]);
		});

		it("should replace non-empty array with empty array", () => {
			const target = { items: ["old1", "old2"] };
			const source = { items: [] };

			const result = assign(target, source);

			expect(result.items).toEqual([]);
		});

		it("should handle 2D arrays", () => {
			const target = { matrix: [["a", "b"], ["c", "d"], ["e", "f"]] };
			const source = { matrix: [["x"], ["y"]] };

			const result = assign(target, source);

			expect(result.matrix).toEqual([["x"], ["y"]]);
			expect(result.matrix.length).toBe(2);
		});

		it("should handle arrays with different types", () => {
			const target = { mixed: [1, 2, 3, 4, 5] };
			const source = { mixed: ["string1", "string2"] };

			const result = assign(target, source);

			expect(result.mixed).toEqual(["string1", "string2"]);
		});

		it("should handle multiple properties with arrays", () => {
			const target = {
				numbers: [1, 2, 3, 4, 5],
				strings: ["a", "b", "c"],
				booleans: [true, false, true]
			};
			const source = {
				numbers: [10, 20],
				strings: ["x"],
				booleans: [false]
			};

			const result = assign(target, source);

			expect(result.numbers).toEqual([10, 20]);
			expect(result.strings).toEqual(["x"]);
			expect(result.booleans).toEqual([false]);
		});
	});

	describe("object deep merging (existing behavior)", () => {
		it("should still deep merge objects", () => {
			const target = {
				config: {
					name: "original",
					settings: {
						volume: 50,
						quality: "high"
					}
				}
			};
			const source = {
				config: {
					settings: {
						volume: 75
					}
				}
			};

			const result = assign(target, source);

			// オブジェクトは深くマージされる（既存動作の維持）
			expect(result.config.name).toBe("original");  // 保持される
			expect(result.config.settings.volume).toBe(75);  // 上書きされる
			expect(result.config.settings.quality).toBe("high");  // 保持される
		});

		it("should handle mixed arrays and objects", () => {
			const target = {
				arrays: ["old1", "old2"],
				objects: {
					prop1: "value1",
					prop2: "value2"
				}
			};
			const source = {
				arrays: ["new1"],
				objects: {
					prop2: "updated_value2",
					prop3: "value3"
				}
			};

			const result = assign(target, source);

			// 配列は置き換え
			expect(result.arrays).toEqual(["new1"]);
			// オブジェクトは深くマージ
			expect(result.objects.prop1).toBe("value1");  // 保持
			expect(result.objects.prop2).toBe("updated_value2");  // 上書き
			expect(result.objects.prop3).toBe("value3");  // 追加
		});
	});

	describe("edge cases", () => {
		it("should handle null and undefined", () => {
			const target = { arr: ["a", "b"] };

			// null で上書き
			const result1 = assign(target, { arr: null });
			expect(result1.arr).toBeNull();

			// undefined で上書き
			const result2 = assign(target, { arr: undefined });
			expect(result2.arr).toBeUndefined();
		});

		it("should handle multiple sources", () => {
			const target = { items: [1, 2, 3] };
			const source1 = { items: ["a", "b"] };
			const source2 = { items: ["x"] };

			const result = assign(target, source1, source2);

			// 最後のソースが適用される
			expect(result.items).toEqual(["x"]);
		});
	});
});

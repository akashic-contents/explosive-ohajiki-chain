import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			// import type を強制
			"@typescript-eslint/consistent-type-imports": ["error", {
				"prefer": "type-imports"
			}],

			// スタイル: タブインデント
			"indent": ["error", "tab"],

			// クォート: ダブルクォート
			"quotes": ["error", "double"],

			// セミコロン必須
			"semi": ["error", "always"],

			// 行の最大長: 140文字
			"max-len": ["error", { "code": 140 }],

			// ファイル末尾改行
			"eol-last": ["error", "always"],

			// 末尾空白禁止
			"no-trailing-spaces": "error",

			// 厳密等価（nullは例外）
			"eqeqeq": ["error", "always", { "null": "ignore" }],

			// for-in guard
			"guard-for-in": "error",

			// コンストラクタ禁止
			"no-new-wrappers": "error",

			// debugger禁止
			"no-debugger": "error",

			// eval禁止
			"no-eval": "error",

			// switch fall-through
			"no-fallthrough": "error",

			"@typescript-eslint/unbound-method": "off",
		    "@typescript-eslint/no-this-alias": "off",

			// @deprecatedなAPIの使用を検出
			"@typescript-eslint/no-deprecated": "warn",

			// コンソール制限（debug, info, time等を禁止）
			"no-console": ["error", {
				"allow": ["warn", "error", "log"]
			}],

			// 未使用変数（_プレフィックスは許可）
			"@typescript-eslint/no-unused-vars": ["error", {
				"argsIgnorePattern": "^_"
			}],

			// 宣言前使用禁止
			"@typescript-eslint/no-use-before-define": "error",

			// 型定義必須
			"@typescript-eslint/typedef": ["error", {
				"propertyDeclaration": true,
				"memberVariableDeclaration": true,
				"parameter": true
			}],

			// TSLintで無効化されていたルールをオフ
			"curly": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-inferrable-types": "off",

			// TypeScript特有の調整
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-argument": "off"
		}
	},
	{
		ignores: ["script/**", "node_modules/**", "dist/**"]
	}
);

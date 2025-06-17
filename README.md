# RPN Calculator Web App

逆ポーランド記法（RPN）を使用した電卓のWebアプリケーション。モバイルデバイスでの使用に最適化。

## 主な機能

- **RPN（逆ポーランド記法）計算**: HP電卓と同様の操作方法
- **スタック表示**: 最大4レベルのスタック表示（T, Z, Y, X）
- **科学記数法**: EEXキーによる指数入力（例: 1.5e3 = 1500）
- **基本四則演算**: +, -, ×, ÷
- **スタック操作**: Enter, Drop, Swap, 符号切替
- **履歴機能**: Undoによる操作の取り消し
- **モバイル最適化**: iPhone Safari等でのフルスクリーン表示対応

## 技術スタック

- **Vue 3** (Composition API) - リアクティブなUI
- **TypeScript** - 型安全性の確保
- **Pinia** - 状態管理
- **Vite** - 高速なビルドツール
- **Vitest** - 単体テスト
- **Playwright** - E2Eテスト
- **ESLint + Prettier** - コード品質管理

## アーキテクチャ

```
src/
├── components/          # Vue コンポーネント
│   ├── RPNCalculator.vue       # メインの電卓コンポーネント
│   ├── CalculatorDisplay.vue   # スタック表示画面
│   ├── CalculatorKeyboard.vue  # キーボードレイアウト
│   └── CalculatorButton.vue    # 個別ボタンコンポーネント
├── stores/             # Pinia ストア
│   └── rpnCalculator.ts        # 電卓ロジック・状態管理
├── types/              # TypeScript 型定義
│   └── calculator.ts           # 電卓関連の型定義
└── assets/             # 静的リソース
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

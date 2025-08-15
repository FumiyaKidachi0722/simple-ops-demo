# SimpleOps Demo – Firebase × Next.js 15 × React 19 × shadcn/ui による業務管理 MVP

**SimpleOps Demo** は、顧客・在庫（ボトル）・売上・勤怠など、  
小規模ビジネス向けの業務情報を一元管理できるモダンな MVP デモです。

- 🚀 **Next.js 15 (App Router)** + **React 19（Async Server Components）**
- 🎨 **shadcn/ui** によるアクセシブルな美しい UI
- 🔥 **Firebase Auth / Firestore** によるリアルタイム同期
- 🧩 顧客・在庫・売上・勤務を対象にした汎用的な業務ダッシュボード

---

## 🧪 技術スタック

| 区分           | 使用技術                                    |
| -------------- | ------------------------------------------- |
| フレームワーク | Next.js 15 (App Router), React 19           |
| 言語           | TypeScript                                  |
| スタイリング   | Tailwind CSS, shadcn/ui                     |
| 認証           | Firebase Authentication                     |
| DB             | Firebase Firestore (NoSQL, リアルタイム DB) |

---

## 🧩 管理対象モジュール

| モジュール | 説明                                       |
| ---------- | ------------------------------------------ |
| 顧客管理   | 顧客の登録・タグ管理・来店履歴の管理       |
| ボトル管理 | 商品マスタとキープボトル（顧客別）の管理   |
| 売上伝票   | 来店ごとの会計情報、キャスト売上、明細作成 |
| 勤怠打刻   | 出退勤打刻、休憩、実働時間の記録           |

---

## 🧱 アーキテクチャ指針

- UI コンポーネントは Atomic Design（atoms / molecules / organisms / templates / pages）で整理
- ドメインロジックは Clean Architecture（domain / application / infrastructure / presentation）を採用

---

## 🎨 UI 構成（shadcn/ui）

- UI コンポーネントには `shadcn/ui` を採用（Radix UI ベース + Tailwind CSS）
- 使用コンポーネント例:
  - `Card`, `Button`, `Table`, `Dialog`, `Tabs`, `Alert`, `Badge`, `Form`, `Sheet`
- デザインはスマホ・タブレットにも対応済み（現場使用を想定）

---

## 🔧 セットアップ方法

### 1. Firebase プロジェクトの準備

Firebase Console で以下を有効化：

- Authentication（Email/Password）
- Cloud Firestore（ネイティブモード）

### 2. `.env.local` 作成

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_TZ=Asia/Tokyo
```

これらの環境変数はすべて Firebase コンソールのプロジェクト設定から取得してください。
いずれかが未設定の場合、ユーザー登録時に `Firebase: Error (auth/configuration-not-found)` が発生することがあります。

### 3. パッケージインストール

```bash
npm install
```

### 4. 開発サーバ起動

```bash
npm run dev
```

---

## 📁 ディレクトリ構成（抜粋）

```
/app
/components
  /atoms
  /molecules
  /organisms
  /templates
  /pages
  /ui          # shadcn/ui の拡張（変更禁止）
/domain
/application
/infrastructure
/lib
  firebase.ts
  auth.ts
  db.ts
  utils.ts
```

---

## 🖥 ルーティング一覧

| パス              | 機能                             |
| ----------------- | -------------------------------- |
| `/login`          | Firebase Auth (Email/Password)   |
| `/dashboard`      | サマリー（売上、勤怠、キープ等） |
| `/customers`      | 顧客の検索・一覧・追加           |
| `/customers/[id]` | 顧客詳細（履歴、キープ）         |
| `/keeps`          | キープボトル管理（期限昇順）     |
| `/bills/[id]`     | 会計伝票と明細入力               |
| `/me/attendance`  | スタッフの勤怠打刻画面           |
| `/attendance`     | 勤怠一覧／承認（管理者）         |
| `/sales`          | 売上一覧、担当キャスト別集計     |

---

## 📄 データ構成（Firestore）

- `users/{uid}`: ロール（cast/manager）、表示名など
- `customers/{customerId}`: 顧客名、タグ、最終来店日など
- `bottles/{bottleId}`: 銘柄マスタ、価格、カテゴリ
- `keeps/{keepId}`: ボトルのキープ状態、開栓日、有効期限
- `bills/{billId}`: 来店ごとの会計情報
  - `bills/{billId}/items/{itemId}`: セット、指名、ボトルなどの明細

- `attendances/{attendanceId}`: 出勤/退勤/休憩/労働時間

---

## 📸 デモの流れ（3〜5 分）

1. `/login` → `manager` でログイン
2. `/customers` で新規顧客登録 or 選択
3. `/bills/[id]` で会計伝票作成（明細を追加）
4. `/keeps` でボトルキープの登録／開栓
5. `/me/attendance` で打刻 → `/attendance` で確認
6. `/sales` で売上反映を確認

---

## ✅ アピールポイント

- **React 19 + Next.js 15** によるモダンな App Router 構成
- **shadcn/ui** の洗練された UI と開発効率の両立
- Firestore によるリアルタイム同期（create/update/delete）
- 汎用業務（顧客／在庫／売上／勤怠）管理を 1 画面で可視化
- 店舗／サロン／接客業などで活用可能な構造

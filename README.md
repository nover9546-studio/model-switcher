# model-switcher

Claude Code mod：在輸入框上方加一排「模型」與「投入程度」切換選項，點一下就能換，不用開選單。

- **模型**：Opus 5.5、Sonnet 5.5、Haiku 5.5
- **投入程度**：低、中、高、超高、最高
- 選中的項目是白色並加 `✓`，其他是灰色。

## 運作方式

點選後，之後每個送給模型的請求（主對話，不含子代理人）都會改用你選的模型與投入程度，直到你再點別的或重開 session。App 原本的模型選單不會跟著變，以這一排的 `✓` 為準。

注意：對話已經很長時切換模型，第一次請求會重新建立快取，用量會較高。

## 安裝

在終端機的 Claude Code 提示列：

```
/plugin install model-switcher --marketplace nover9546-studio/model-switcher
```

或在 shell：

```
claude plugin install model-switcher --marketplace nover9546-studio/model-switcher
```

桌面版不能用 `/plugin`：點提示框旁的 +，選 Plugins → Add marketplace，填 `nover9546-studio/model-switcher`，再 Add plugin。

## 其他

若你同時裝了其他也畫在輸入框上方（AbovePrompt）的外掛，它必須把下層畫面一併畫出來（呼叫 `next(e)`），這個 mod 才會顯示。

授權：MIT

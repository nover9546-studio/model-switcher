export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
export type Seen = { model: string; effort: string | null }

declare module 'claude-code' {
  interface PluginState {
    'model-switcher': {
      // null = 不覆寫，沿用目前 session 的設定
      model: string | null
      effort: Effort | null
      // 最近一次請求實際用的模型與投入程度，用來標示「目前」
      seen: Seen | null
    }
  }
}

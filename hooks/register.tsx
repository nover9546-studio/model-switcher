import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Effort, Seen } from '../types'

const model = atom({ plugin: 'model-switcher', key: 'model' } as const, null)
const effort = atom({ plugin: 'model-switcher', key: 'effort' } as const, null)
const seen = atom({ plugin: 'model-switcher', key: 'seen' } as const, null)

// 不含 Fable
const MODELS = [
  { id: 'claude-opus-5-5', family: 'opus', label: 'Opus 5.5' },
  { id: 'claude-sonnet-5-5', family: 'sonnet', label: 'Sonnet 5.5' },
  { id: 'claude-haiku-5-5', family: 'haiku', label: 'Haiku 5.5' },
] as const

const EFFORTS: { id: Effort; label: string }[] = [
  { id: 'low', label: '低' },
  { id: 'medium', label: '中' },
  { id: 'high', label: '高' },
  { id: 'xhigh', label: '超高' },
  { id: 'max', label: '最高' },
]

export const register: Register = on => {
  // 每個請求送出前套用選擇；沒選的就維持原樣
  on('turn.step', async function* ($, e, next) {
    // 子代理人的請求不動
    if (e.agentId !== undefined) {
      return yield* next(e)
    }

    const m = await read($, model)
    const f = await read($, effort)
    const out = {
      ...e,
      ...(m ? { model: m } : {}),
      ...(f ? { effort: f } : {}),
    }

    const prev = await read($, seen)
    const now: Seen = { model: out.model, effort: typeof out.effort === 'string' ? out.effort : null }
    if (!prev || prev.model !== now.model || prev.effort !== now.effort) {
      await update($, seen, () => now)
    }

    return yield* next(out)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // 先取得下層（進度 mod 等）畫的內容，自己放在它上面
    const below = await next(e)

    if (e.props.hasSurvey) {
      return below
    }

    const chosenModel = await read($, model)
    const chosenEffort = await read($, effort)
    const last = await read($, seen)
    const current = chosenModel ?? last?.model ?? (await $.session.model())
    const currentEffort = chosenEffort ?? last?.effort ?? null
    const { Box, Text, Markdown } = $.ui.resolve(e)

    const base = 'https://model-switcher.invalid/'
    const item = (key: string, label: string, path: string, isOn: boolean) => (
      <Markdown
        key={key}
        text={`[${isOn ? '✓ ' : ''}${label}](${base}${path})`}
        dimColor={!isOn}
        onLinkPress={press}
      />
    )

    const press = (l: { href: string }) => {
      const [kind, id] = l.href.replace(base, '').split('/')
      if (kind === 'm') {
        return update($, model, () => id ?? null)
      }
      if (kind === 'e') {
        return update($, effort, () => (id as Effort) ?? null)
      }
    }

    const mine = (
      <Box gap={4} marginBottom={1}>
        <Box gap={2}>
          <Text weight="bold">模型</Text>
          {MODELS.map(m => item(`m-${m.family}`, m.label, `m/${m.id}`, current.includes(m.family)))}
        </Box>
        <Box gap={2}>
          <Text weight="bold">投入程度</Text>
          {EFFORTS.map(f => item(`e-${f.id}`, f.label, `e/${f.id}`, currentEffort === f.id))}
        </Box>
      </Box>
    )

    return (
      <Box flexDirection="column">
        {mine}
        {below}
      </Box>
    )
  })
}

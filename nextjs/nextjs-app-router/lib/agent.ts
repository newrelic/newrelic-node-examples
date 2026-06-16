import type { EventEmitter } from 'node:events'

export async function loadNewRelicAgent() {
  const { default: newrelic } = await import('newrelic')
  const agent = newrelic?.agent as
    | (EventEmitter & { collector?: { isConnected?: () => boolean } })
    | undefined
  if (!agent || agent.collector?.isConnected?.()) {
    return newrelic
  }

  await new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer)
      agent.removeListener('started', done)
      agent.removeListener('errored', done)
      resolve()
    }
    const timer = setTimeout(done, 8000)
    agent.once('started', done)
    agent.once('errored', done)
  })

  return newrelic
}


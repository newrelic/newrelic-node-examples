import { loadNewRelicAgent  } from './lib/agent'

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }

  await loadNewRelicAgent() 
}

// The newrelic package ships no type declarations. Declare the slice of the
// agent API this app actually uses (getBrowserTimingHeader, agent.collector).
declare module 'newrelic' {
  import type { EventEmitter } from 'node:events'

  interface NewRelicAgent extends EventEmitter {
    collector?: { isConnected?: () => boolean }
  }

  interface NewRelic {
    agent?: NewRelicAgent
    getBrowserTimingHeader(options?: {
      hasToRemoveScriptWrapper?: boolean
      allowTransactionlessInjection?: boolean
    }): string
  }

  const newrelic: NewRelic
  export default newrelic
}

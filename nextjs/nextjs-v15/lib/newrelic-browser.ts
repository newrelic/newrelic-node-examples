/**
 * Generates the New Relic Browser timing header (RUM script) for injection into HTML <head>.
 *
 * This function ensures the header is generated within an active transaction,
 * which is required by the New Relic Node.js agent. It gracefully handles
 * missing context or agent issues without crashing the application.
 */

export const getBrowserTimingScript = () => {
  try {
    // Import the New Relic Node.js agent at runtime using require()
    // This avoids import issues in ESM/Next.js environments and keeps this code server-only.
    const newrelic = require('newrelic')

    /**
     * New Relic's getBrowserTimingHeader() must be called within the context of an active transaction.
     * Since Next.js App Router server components may not guarantee this by default, we manually start
     * a synthetic web transaction just for the purpose of generating the browser timing script.
     *
     * The transaction name 'SSR Layout' is arbitrary and used for grouping in the APM UI.
     */
    return newrelic.startWebTransaction('SSR Layout', () => {
      const header = newrelic.getBrowserTimingHeader({
        // Removes the <script> wrapper from the returned HTML so we can inject it ourselves
        hasToRemoveScriptWrapper: true,

        // Allows script generation even if a real transaction isn't automatically detected
        allowTransactionlessInjection: true,
      })

      // Manually end the synthetic transaction we started
      newrelic.endTransaction()

      // Return the raw script content
      return header
    })
  } catch (error) {
    // If anything goes wrong (agent not loaded, header not available, etc.),
    // log a warning but fail gracefully — returning an empty string is safe for layout injection
    console.warn('[New Relic] Failed to generate browser timing header:', error)
    return ''
  }
}

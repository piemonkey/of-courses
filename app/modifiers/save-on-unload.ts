import { modifier } from 'ember-modifier'
import { trackedMap } from '@ember/reactive/collections'

// For testing
export const wndw = { document }

export function loadState() {
  const savedState = window.localStorage.getItem('state')
  if (!savedState) return {}
  try {
    return JSON.parse(savedState, (_key, val: unknown) => {
      if (
        typeof val === 'object' &&
        val &&
        'MAP' in val &&
        Array.isArray(val.MAP)
      ) {
        return trackedMap(val.MAP)
      }
      return val
    }) as Record<string, unknown>
  } catch (err) {
    console.warn('unable to load state', err)
    return {}
  }
}

interface SaveOnUnloadSignature {
  Element: Element
  Args: {
    Positional: [toSave: Record<string, unknown>]
  }
}

export default modifier<SaveOnUnloadSignature>(function saveOnUnload(
  element,
  [toSave]
) {
  function storeState(_: Event) {
    if (wndw.document.hidden) {
      window.localStorage.setItem(
        'state',
        JSON.stringify(toSave, (_key, val) => {
          if (val instanceof Map) {
            return { MAP: [...val.entries()] }
          }
          return val as unknown
        })
      )
    }
  }
  window.addEventListener('visibilitychange', storeState)

  return () => {
    element.removeEventListener('visibilitychange', storeState)
  }
})

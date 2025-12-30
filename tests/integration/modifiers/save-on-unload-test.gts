import { module, test } from 'qunit'
import { render } from '@ember/test-helpers'
import { hash } from '@ember/helper'
import { setupRenderingTest } from 'of-courses/tests/helpers'
import saveOnUnload, {
  wndw,
  loadState,
} from 'of-courses/modifiers/save-on-unload'

module('Integration | Modifier | save-on-unload', function (hooks) {
  setupRenderingTest(hooks)

  hooks.beforeEach(function () {
    window.localStorage.clear()
    wndw.document = { ...document, hidden: true }
  })

  test('it saves a basic object', async function (assert) {
    const someData: Record<string, string> = { test: 'testtest' }

    await render(
      <template>
        <div {{saveOnUnload (hash saved=someData)}}></div>
      </template>
    )
    window.dispatchEvent(new Event('visibilitychange'))
    const stored = window.localStorage.getItem('state')
    const parsed = stored
      ? (JSON.parse(stored) as unknown as { saved: unknown })
      : undefined

    assert.deepEqual(parsed?.saved, someData)
  })

  test('it saves and parses a Map', async function (assert) {
    const someData = new Map([['test', 'testtest']])

    await render(
      <template>
        <div {{saveOnUnload (hash saved=someData)}}></div>
      </template>
    )
    window.dispatchEvent(new Event('visibilitychange'))
    const stored = loadState()

    assert.equal((stored?.saved as Map<string, string>).size, 1)
    assert.equal((stored?.saved as Map<string, string>).get('test'), 'testtest')
  })
})

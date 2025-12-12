import { module, test } from 'qunit'
import { setupRenderingTest } from 'off-courses/tests/helpers'
import { render } from '@ember/test-helpers'
import Bouffe from 'off-courses/components/bouffe'

module('Integration | Component | bouffe', function (hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function (assert) {
    // Updating values is achieved using autotracking, just like in app code. For example:
    // class State { @tracked myProperty = 0; }; const state = new State();
    // and update using state.myProperty = 1; await rerender();
    // Handle any actions with function myAction(val) { ... };

    await render(<template><Bouffe /></template>)

    assert.dom().hasText(/Money paid/)

    //     // Template block usage:
    //     await render(<template>
    //       <Bouffe />
    //     </template>);

    //     assert.dom().hasText('template block text');
  })
})

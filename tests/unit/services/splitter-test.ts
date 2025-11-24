import { module, test } from 'qunit';
import { setupTest } from 'off-courses/tests/helpers';

module('Unit | Service | splitter', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:splitter');
    assert.ok(service);
  });
});

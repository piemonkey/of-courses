import { module, test } from 'qunit'
import { Temporal } from '@js-temporal/polyfill'
import { setupTest } from 'off-courses/tests/helpers'
import type { Purchases, Ratios } from 'off-courses/services/splitter'

module('Unit | Service | splitter', function (hooks) {
  setupTest(hooks)

  module('calculateMealPrices', function () {
    test('Sums a boring balanced split', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const start = Temporal.PlainDate.from('2025-11-01')
      const end = Temporal.PlainDate.from('2025-11-16')
      const purchases: Purchases = new Map([
        ['Gaelle', 5],
        ['Gobs', 5],
        ['Leo', 5],
        ['Maïlys', 5],
        ['Rich', 5],
        ['Soura', 5],
      ])
      const ratios: Ratios = new Map([['breakfast', 0.25], ['lunch', 0.25], ['dinner', 0.5]])

      const res = service.calculateMealPrices(purchases, ratios, start, end)

      assert.equal(res.get('breakfast'), 0.5)
      assert.equal(res.get('lunch'), 0.5)
      assert.equal(res.get('dinner'), 1)
      assert.equal(res.size, 3)
    })

    test('Sums a non-balanced split', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const start = Temporal.PlainDate.from('2025-11-01')
      const end = Temporal.PlainDate.from('2025-11-21')
      const purchases: Purchases = new Map([
        ['Gaelle', 5],
        ['Gobs', 5],
        ['Leo', 5],
        ['Maïlys', 5],
        ['Rich', 5],
        ['Soura', 5],
      ])
      const ratios: Ratios = new Map([['breakfast', 1], ['lunch', 2], ['dinner', 3]])

      const res = service.calculateMealPrices(purchases, ratios, start, end)

      assert.equal(res.get('breakfast'), 0.25)
      assert.equal(res.get('lunch'), 0.5)
      assert.equal(res.get('dinner'), 0.75)
      assert.equal(res.size, 3)
    })
  })
})

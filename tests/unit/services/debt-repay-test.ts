import { module, test } from 'qunit'
import { setupTest } from 'of-courses/tests/helpers'
import type { Purchases } from 'of-courses/services/splitter'

module('Unit | Service | debt-repay', function (hooks) {
  setupTest(hooks)

  test('it ignores all zeros', function (assert) {
    const balances: Purchases = new Map([
      ['Gaelle', 0],
      ['Gobs', 0],
      ['Leo', 0],
      ['Maïlys', 0],
      ['Rich', 0],
      ['Soura', 0],
    ])
    const service = this.owner.lookup('service:debt-repay')

    const payments = service.repay(balances)

    assert.deepEqual(payments, [])
  })

  test('it works out one simple payment', function (assert) {
    const balances: Purchases = new Map([
      ['Gaelle', 20],
      ['Gobs', 0],
      ['Leo', -20],
      ['Maïlys', 0],
      ['Rich', 0],
      ['Soura', 0],
    ])
    const service = this.owner.lookup('service:debt-repay')

    const payments = service.repay(balances)

    assert.deepEqual(payments, [{ from: 'Gaelle', to: 'Leo', amount: 20 }])
  })

  test('it works out multiple simple payments', function (assert) {
    const balances: Purchases = new Map([
      ['Gaelle', 20],
      ['Gobs', -55],
      ['Leo', -20],
      ['Maïlys', 13],
      ['Rich', 55],
      ['Soura', -13],
    ])
    const service = this.owner.lookup('service:debt-repay')

    const payments = service.repay(balances)

    assert.deepEqual(payments, [
      { from: 'Rich', to: 'Gobs', amount: 55 },
      { from: 'Gaelle', to: 'Leo', amount: 20 },
      { from: 'Maïlys', to: 'Soura', amount: 13 },
    ])
  })

  test('it works out more complex repayments', function (assert) {
    const balances: Purchases = new Map([
      ['Gaelle', 32],
      ['Gobs', -55],
      ['Leo', -20],
      ['Maïlys', 16],
      ['Rich', 40],
      ['Soura', -13],
    ])
    const service = this.owner.lookup('service:debt-repay')

    const payments = service.repay(balances)

    assert.deepEqual(payments, [
      { from: 'Rich', to: 'Gobs', amount: 40 },
      { from: 'Gaelle', to: 'Gobs', amount: 15 },
      { from: 'Gaelle', to: 'Leo', amount: 17 },
      { from: 'Maïlys', to: 'Leo', amount: 3 },
      { from: 'Maïlys', to: 'Soura', amount: 13 },
    ])
  })

  test('it works out complex repayments example 2', function (assert) {
    const balances: Purchases = new Map([
      ['Gaelle', -74],
      ['Gobs', -29],
      ['Leo', 88],
      ['Maïlys', -17],
      ['Rich', -53],
      ['Soura', 85],
    ])
    const service = this.owner.lookup('service:debt-repay')

    const payments = service.repay(balances)

    assert.deepEqual(payments, [
      { from: 'Leo', to: 'Gaelle', amount: 74 },
      { from: 'Leo', to: 'Rich', amount: 14 },
      { from: 'Soura', to: 'Rich', amount: 39 },
      { from: 'Soura', to: 'Gobs', amount: 29 },
      { from: 'Soura', to: 'Maïlys', amount: 17 },
    ])
  })
})

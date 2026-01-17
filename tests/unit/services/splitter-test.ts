import { assert, module, test } from 'qunit'
import { setupTest } from 'of-courses/tests/helpers'
import {
  meals,
  type Meal,
  type MealCounts,
  type MealTotals,
  type Privileges,
  type Purchases,
  type Ratios,
} from 'of-courses/services/splitter'

interface CustomAssert {
  mapMoneyCloseTo(actual: Map<unknown, number> | undefined, expected: Map<unknown, number>, message?: string): void;
}
declare global {
  // Hack to add this to qunit's definitions
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assert extends CustomAssert {}
}

assert.mapMoneyCloseTo = function (actual, expected, message) {
  const acEntries = actual && Array.from(actual.entries())
  const exEntries = Array.from(expected.entries())
  const result = !!acEntries && acEntries.length === exEntries.length && acEntries.every(([key, val], i) => exEntries[i] && exEntries[i][0] === key && Math.abs(exEntries[i][1] - val) < 0.01)
  assert.pushResult({ result, actual: acEntries, expected: exEntries, message })
}

module('Unit | Service | splitter', function (hooks) {
  setupTest(hooks)

  module('privilegeAdjustCounts', function () {
    test('Adjusts equal privelges back to 1', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Gobs', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Leo', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Maïlys', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Rich', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Soura', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
      ])
      const privs: Privileges = new Map([
        ['Gaelle', 1.1],
        ['Gobs', 1.1],
        ['Leo', 1.1],
        ['Maïlys', 1.1],
        ['Rich', 1.1],
        ['Soura', 1.1],
      ])

      const res = service.privilegeAdjustCounts(mealCounts, privs)

      const mealsExp = new Map([['breakfast', 5], ['lunch', 6], ['dinner', 7]])
      assert.mapMoneyCloseTo(res.get('Gaelle'), mealsExp)
      assert.mapMoneyCloseTo(res.get('Gobs'), mealsExp)
      assert.mapMoneyCloseTo(res.get('Leo'), mealsExp)
      assert.mapMoneyCloseTo(res.get('Maïlys'), mealsExp)
      assert.mapMoneyCloseTo(res.get('Rich'), mealsExp)
      assert.mapMoneyCloseTo(res.get('Soura'), mealsExp)
      assert.deepEqual(res.size, 6)
    })

    test('Handles balanced privileges', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal, i) => [meal, 0 + i]))],
        ['Gobs', new Map(meals.map((meal: Meal, i) => [meal, 1 + i]))],
        ['Leo', new Map(meals.map((meal: Meal, i) => [meal, 2 + i]))],
        ['Maïlys', new Map(meals.map((meal: Meal, i) => [meal, 3 + i]))],
        ['Rich', new Map(meals.map((meal: Meal, i) => [meal, 4 + i]))],
        ['Soura', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
      ])
      const privs: Privileges = new Map([
        ['Gaelle', 0.9],
        ['Gobs', 1],
        ['Leo', 1.1],
        ['Maïlys', 1.2],
        ['Rich', 1],
        ['Soura', 0.8],
      ])

      const res = service.privilegeAdjustCounts(mealCounts, privs)

      assert.mapMoneyCloseTo(res.get('Gaelle'), new Map([['breakfast', 0], ['lunch', 0.9], ['dinner', 1.8]]))
      assert.mapMoneyCloseTo(res.get('Gobs'), new Map([['breakfast', 1], ['lunch', 2], ['dinner', 3]]))
      assert.mapMoneyCloseTo(res.get('Leo'), new Map([['breakfast', 2.2], ['lunch', 3.3], ['dinner', 4.4]]))
      assert.mapMoneyCloseTo(res.get('Maïlys'), new Map([['breakfast', 3.6], ['lunch', 4.8], ['dinner', 6]]))
      assert.mapMoneyCloseTo(res.get('Rich'), new Map([['breakfast', 4], ['lunch', 5], ['dinner', 6]]))
      assert.mapMoneyCloseTo(res.get('Soura'), new Map([['breakfast', 4], ['lunch', 4.8], ['dinner', 5.6]]))
      assert.deepEqual(res.size, 6)
    })

    test('Handles an unbalanced mess', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal, i) => [meal, 0 + i]))],
        ['Gobs', new Map(meals.map((meal: Meal, i) => [meal, 1 + i]))],
        ['Leo', new Map(meals.map((meal: Meal, i) => [meal, 2 + i]))],
      ])
      const privs: Privileges = new Map([
        ['Gaelle', 1],
        ['Gobs', 2],
        ['Leo', 3],
      ])

      const res = service.privilegeAdjustCounts(mealCounts, privs)

      assert.mapMoneyCloseTo(res.get('Gaelle'), new Map([['breakfast', 0], ['lunch', 0.5], ['dinner', 1]]))
      assert.mapMoneyCloseTo(res.get('Gobs'), new Map([['breakfast', 1], ['lunch', 2], ['dinner', 3]]))
      assert.mapMoneyCloseTo(res.get('Leo'), new Map([['breakfast', 3], ['lunch', 4.5], ['dinner', 6]]))
      assert.deepEqual(res.size, 3)
    })
  })

  module('calculateMealTotals', function () {
    test('Works out a very easy case', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Gobs', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Leo', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Maïlys', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Rich', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Soura', new Map(meals.map((meal: Meal) => [meal, 5]))],
      ])

      const res = service.calculateMealTotals(mealCounts)

      assert.deepEqual(res.get('breakfast'), 30)
      assert.deepEqual(res.get('lunch'), 30)
      assert.deepEqual(res.get('dinner'), 30)
      assert.deepEqual(res.size, 3)
    })
    test('Works out a slightly less easy case', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Gobs', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Leo', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Maïlys', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Rich', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
        ['Soura', new Map(meals.map((meal: Meal, i) => [meal, 5 + i]))],
      ])

      const res = service.calculateMealTotals(mealCounts)

      assert.deepEqual(res.get('breakfast'), 30)
      assert.deepEqual(res.get('lunch'), 36)
      assert.deepEqual(res.get('dinner'), 42)
      assert.deepEqual(res.size, 3)
    })
  })

  module('calculateMealPrices', function () {
    test('Sums a completely even split', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealTotals: MealTotals = new Map([
        ['breakfast', 10],
        ['lunch', 10],
        ['dinner', 10],
      ])
      const purchases: Purchases = new Map([
        ['Gaelle', 5],
        ['Gobs', 5],
        ['Leo', 5],
        ['Maïlys', 5],
        ['Rich', 5],
        ['Soura', 5],
      ])
      const ratios: Ratios = new Map([
        ['breakfast', 1],
        ['lunch', 1],
        ['dinner', 1],
      ])

      const res = service.calculateMealPrices(mealTotals, purchases, ratios)

      assert.equal(res.get('breakfast'), 1)
      assert.equal(res.get('lunch'), 1)
      assert.equal(res.get('dinner'), 1)
      assert.equal(res.size, 3)
    })

    test('Sums a split that sums to 1', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealTotals: MealTotals = new Map([
        ['breakfast', 15],
        ['lunch', 15],
        ['dinner', 15],
      ])
      const purchases: Purchases = new Map([
        ['Gaelle', 5],
        ['Gobs', 5],
        ['Leo', 5],
        ['Maïlys', 5],
        ['Rich', 5],
        ['Soura', 5],
      ])
      const ratios: Ratios = new Map([
        ['breakfast', 0.5],
        ['lunch', 0.5],
        ['dinner', 1],
      ])

      const res = service.calculateMealPrices(mealTotals, purchases, ratios)

      assert.equal(res.get('breakfast'), 0.5)
      assert.equal(res.get('lunch'), 0.5)
      assert.equal(res.get('dinner'), 1)
      assert.equal(res.size, 3)
    })

    test('Sums a non-balanced split', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealTotals: MealTotals = new Map([
        ['breakfast', 10],
        ['lunch', 20],
        ['dinner', 25],
      ])
      const purchases: Purchases = new Map([
        ['Gaelle', 5],
        ['Gobs', 5],
        ['Leo', 5],
        ['Maïlys', 5],
        ['Rich', 5],
        ['Soura', 5],
      ])
      const ratios: Ratios = new Map([
        ['breakfast', 1],
        ['lunch', 2],
        ['dinner', 3],
      ])

      const res = service.calculateMealPrices(mealTotals, purchases, ratios)

      assert.equal(res.get('breakfast'), 0.5)
      assert.equal(res.get('lunch'), 0.5)
      assert.equal(res.get('dinner'), 0.6)
      assert.equal(res.size, 3)
    })
  })

  module('calculateSpent', function () {
    test('Works out a very easy case', function (assert) {
      const service = this.owner.lookup('service:splitter')
      const mealCounts: MealCounts = new Map([
        ['Gaelle', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Gobs', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Leo', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Maïlys', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Rich', new Map(meals.map((meal: Meal) => [meal, 5]))],
        ['Soura', new Map(meals.map((meal: Meal) => [meal, 5]))],
      ])
      const mealPrices: Ratios = new Map([
        ['breakfast', 1],
        ['lunch', 2],
        ['dinner', 3],
      ])

      const res = service.calculateSpent(mealCounts, mealPrices)

      assert.equal(res.get('Gaelle'), 30)
      assert.equal(res.get('Gobs'), 30)
      assert.equal(res.get('Leo'), 30)
      assert.equal(res.get('Maïlys'), 30)
      assert.equal(res.get('Rich'), 30)
      assert.equal(res.get('Soura'), 30)
      assert.equal(res.size, 6)
    })
  })
})

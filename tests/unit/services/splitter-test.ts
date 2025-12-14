import { module, test } from 'qunit'
import { setupTest } from 'off-courses/tests/helpers'
import {
  meals,
  type Meal,
  type MealCounts,
  type MealTotals,
  type Purchases,
  type Ratios,
} from 'off-courses/services/splitter'

module('Unit | Service | splitter', function (hooks) {
  setupTest(hooks)

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

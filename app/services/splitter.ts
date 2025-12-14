import Service from '@ember/service'

export const people = [
  'Rich',
  'Gaelle',
  'Soura',
  'Leo',
  'Maïlys',
  'Gobs',
] as const
export type Person = (typeof people)[number]
export const meals = ['breakfast', 'lunch', 'dinner'] as const
export type Meal = (typeof meals)[number]

export type Purchases = Map<Person, number>
export type Ratios = Map<Meal, number>
export type MealTotals = Map<Meal, number>
export type MealCounts = Map<Person, Map<Meal, number>>

export default class SplitterService extends Service {
  calculateMealTotals(mealCounts: MealCounts): MealTotals {
    return new Map(
      Array.from(mealCounts.entries()).reduce((totals, [_person, counts]) => {
        Array.from(counts.entries()).forEach(([meal, count]) =>
          totals.set(meal, (totals.get(meal) ?? 0) + count)
        )
        return totals
      }, new Map<Meal, number>())
    )
  }

  calculateMealPrices(
    mealTotals: MealTotals,
    purchases: Purchases,
    ratios: Ratios,
  ): Ratios {
    const totalCost = Array.from(purchases.values()).reduce(
      (total, val) => total + val,
      0
    )
    const ratioScaleFactor = Array.from(ratios.values()).reduce(
      (total, ratio) => total + ratio,
      0
    )
    return new Map(Array.from(mealTotals.entries()).map(
      ([meal, mealTotal]) => [meal, totalCost * (ratios.get(meal) ?? 1) / (ratioScaleFactor * mealTotal)],
    ))
  }

  calculateSpent(mealCounts: MealCounts, mealPrices: Ratios) {
    return new Map(
      Array.from(mealCounts.entries()).map(([person, counts]) => [
        person,
        Array.from(counts.entries()).reduce(
          (total, [meal, count]) => total + count * (mealPrices.get(meal) ?? 0),
          0
        ),
      ])
    )
  }
}

declare module '@ember/service' {
  interface Registry {
    splitter: SplitterService
  }
}

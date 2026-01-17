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
export type Privileges = Map<Person, number>
export type Ratios = Map<Meal, number>
export type MealTotals = Map<Meal, number>
export type MealCounts = Map<Person, MealTotals>

function mapMap<K, V, O>(mapIn: Map<K, V>, fun: (key: K, val: V) => O): Map<K, O> {
  return new Map(Array.from(mapIn.entries()).map(([key, val]) => [key, fun(key, val)]))
}

export default class SplitterService extends Service {
  privilegeAdjustCounts(mealCounts: MealCounts, privileges: Privileges): MealCounts {
    const allPrivs = Array.from(privileges.values())
    const privNormalisation = allPrivs.length / allPrivs.reduce((total, priv) => total + priv)
    return mapMap(mealCounts, (person, totals) =>
      mapMap(totals, (_meal, count) => count * (privileges.get(person) ?? 1) * privNormalisation)
    )
  }

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
    ratios: Ratios
  ): Ratios {
    const totalCost = Array.from(purchases.values()).reduce(
      (total, val) => total + val,
      0
    )
    const ratioScaleFactor = Array.from(ratios.values()).reduce(
      (total, ratio) => total + ratio,
      0
    )
    return new Map(
      Array.from(mealTotals.entries()).map(([meal, mealTotal]) => [
        meal,
        (totalCost * (ratios.get(meal) ?? 1)) / (ratioScaleFactor * mealTotal),
      ])
    )
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

import Service from '@ember/service'

export const people = [
  'Gaelle',
  'Gobs',
  'Leo',
  'Maïlys',
  'Rich',
  'Soura',
] as const
export type Person = (typeof people)[number]
export const meals = ['breakfast', 'lunch', 'dinner'] as const
export type Meal = (typeof meals)[number]

export type Purchases = Map<Person, number>
export type Privileges = Map<Person, number>
export type Ratios = Map<Meal, number>
export type MealTotals = Map<Meal, number>
export type MealCounts = Map<Person, MealTotals>

export function mapMap<K, V, O>(
  mapIn: Map<K, V>,
  fun: (key: K, val: V) => O
): Map<K, O> {
  return new Map(
    Array.from(mapIn.entries()).map(([key, val]) => [key, fun(key, val)])
  )
}

export function sumValues(input: Purchases | Ratios) {
  return Array.from(input.values()).reduce(
    (total, val) => total + val,
    0
  )
}

export default class SplitterService extends Service {
  privilegeAdjustCounts(
    mealCounts: MealCounts,
    privileges: Privileges
  ): MealCounts {
    const allPrivs = Array.from(privileges.values())
    const privNormalisation =
      allPrivs.length / allPrivs.reduce((total, priv) => total + priv)
    return mapMap(mealCounts, (person, totals) =>
      mapMap(
        totals,
        (_meal, count) =>
          count * (privileges.get(person) ?? 1) * privNormalisation
      )
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
    const ratioScaleFactor = sumValues(ratios)
    const adjustedRatios = mapMap(ratios, ((_meal, ratio) => ratio / ratioScaleFactor))
    const scaledMeals = mapMap(mealTotals, (meal, count) => count * adjustedRatios.get(meal)!)
    const totalCost = sumValues(purchases)
    const totalScaledMeals = sumValues(scaledMeals)
    return mapMap(adjustedRatios, ((_meal, ratio) => totalCost / totalScaledMeals * ratio))
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

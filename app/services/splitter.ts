import Service from '@ember/service'
import { Temporal } from '@js-temporal/polyfill'

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

export default class SplitterService extends Service {
  calculateMealPrices(
    purchases: Purchases,
    ratios: Ratios,
    start: Temporal.PlainDate,
    end: Temporal.PlainDate
  ): Ratios {
    const totalCost = Array.from(purchases.values()).reduce(
      (total, val) => total + val,
      0
    )
    const totalMealRatios = Array.from(ratios.values()).reduce(
      (total, val) => total + val,
      0
    )
    const days = end.since(start).days

    return new Map(
      meals.map((meal) => [
        meal,
        (((ratios.get(meal) ?? 0) / totalMealRatios) * totalCost) / days,
      ])
    ) as Ratios
  }
  calculateDebts() {}
}

declare module '@ember/service' {
  interface Registry {
    splitter: SplitterService
  }
}

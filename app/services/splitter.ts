import Service from '@ember/service';

export const people = ['Rich', 'Gaelle', 'Soura', 'Leo', 'Maïlys', 'Gobs'] as const
export type Person = keyof typeof people
export const meals = ['breakfast', 'lunch', 'dinner'] as const
export type Meal = keyof typeof meals

export type Purchases = Record<Person, number>;
export type Ratios = Record<Meal, number>;

export default class SplitterService extends Service {
  calculateMealPrices(purchases: Purchases, ratios: Ratios): Ratios {
    const totalCost = Object.values(purchases).reduce((total, val) => total + val, 0)
    const totalMealRatios = Object.values(ratios).reduce((total, val) => total + val, 0)

  }
  calculateDebts() {
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:splitter')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('splitter') declare altName: SplitterService;`.
declare module '@ember/service' {
  interface Registry {
    'splitter': SplitterService;
  }
}

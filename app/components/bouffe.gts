import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { service } from '@ember/service'
import Component from '@glimmer/component'
import { TrackedMap } from 'tracked-built-ins'
import SplitterService, {
  meals,
  people,
  type Meal,
  type MealCounts,
  type Person,
  type Purchases,
  type Ratios,
} from 'off-courses/services/splitter'

function getMap<K, V>(toGet: Map<K, V> | undefined, key: K): V | undefined {
  return toGet?.get(key)
}
function showCurrency(amount: number | undefined): string | undefined {
  if (amount && Number.isFinite(amount)) {
    return `${amount.toFixed(2)}€`
  }
}

export interface BouffeSignature {
  Element: null
}

export default class Bouffe extends Component<BouffeSignature> {
  @service declare splitter: SplitterService

  mealCounts: MealCounts = new TrackedMap(
    people.map((person) => [
      person,
      new TrackedMap([
        ['breakfast', 0],
        ['lunch', 0],
        ['dinner', 0],
      ]),
    ])
  )
  purchases: Purchases = new TrackedMap(people.map((person) => [person, 0]))
  ratios: Ratios = new TrackedMap([
    ['breakfast', 0.5],
    ['lunch', 0.5],
    ['dinner', 1],
  ])

  getMealCount = (person: Person, meal: Meal) =>
    this.mealCounts.get(person)?.get(meal)
  setMealCount = (person: Person, meal: Meal, event: Event) => {
    const pCount = this.mealCounts.get(person)
    if (event.target && 'value' in event.target && pCount) {
      pCount.set(meal, Number(event.target.value as string))
    }
  }

  setRatio = (meal: Meal, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.ratios.set(meal, Number(event.target.value as string))
    }
  }

  setPurchase = (person: Person, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.purchases.set(person, Number(event.target.value as string))
    }
  }

  get mealCosts() {
    return this.splitter.calculateMealPrices(
      this.splitter.calculateMealTotals(this.mealCounts),
      this.purchases,
      this.ratios,
    )
  }

  get debts() {
    if (this.mealCosts) {
      return this.splitter.calculateSpent(this.mealCounts, this.mealCosts)
    }
  }

  calcBalance = (person: Person) =>
    (this.debts?.get(person) ?? 0) - (this.purchases.get(person) ?? 0)

  ;<template>
    <table>
      <thead>
        <tr>
          <th />
          {{#each people as |person|}}
            <th>{{person}}</th>
          {{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each meals as |meal|}}
          <tr>
            <th>{{meal}}</th>
            {{#each people as |person|}}
              <td>
                <input
                  type="number"
                  value={{getMap (getMap this.mealCounts person) meal}}
                  {{on "change" (fn this.setMealCount person meal)}}
                />
              </td>
            {{/each}}
          </tr>
        {{/each}}
        <tr>
          <th>Money paid</th>
          {{#each people as |person|}}
            <td>
              <input
                type="number"
                value={{getMap this.purchases person}}
                {{on "change" (fn this.setPurchase person)}}
              />
            </td>
          {{/each}}
        </tr>
      </tbody>
    </table>
    <table>
      <thead>
        <tr>
          <th />
          <th>Ratios</th>
        </tr>
      </thead>
      <tbody>
        {{#each meals as |meal|}}
          <tr>
            <th>{{meal}}</th>
            <td>
              <input
                type="number"
                value={{getMap this.ratios meal}}
                {{on "change" (fn this.setRatio meal)}}
              />
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
    <table>
      <thead>
        <tr>
          <th />
          <th>Meal Costs</th>
        </tr>
      </thead>
      <tbody>
        {{#each meals as |meal|}}
          <tr>
            <th>{{meal}}</th>
            <td>
              {{showCurrency (getMap this.mealCosts meal)}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
    <table>
      <thead>
        <tr>
          <th />
          <th>Total 'spent'</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {{#each people as |person|}}
          <tr>
            <th>{{person}}</th>
            <td>
              {{showCurrency (getMap this.debts person)}}
            </td>
            <td>
              {{showCurrency (this.calcBalance person)}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </template>
}

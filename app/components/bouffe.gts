import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { service } from '@ember/service'
import Component from '@glimmer/component'
import { tracked, TrackedMap } from 'tracked-built-ins'
import { Temporal } from '@js-temporal/polyfill'
import SplitterService, {
  meals,
  people,
  type Meal,
  type Person,
  type Purchases,
  type Ratios,
} from 'off-courses/services/splitter'

function getMap<K, V>(toGet: Map<K, V> | undefined, key: K): V | undefined {
  return toGet?.get(key)
}

export interface BouffeSignature {
  Element: null
}

export default class Bouffe extends Component<BouffeSignature> {
  @service declare splitter: SplitterService;

  mealCounts =
    new TrackedMap(
      people.map((person) => [
        person,
        new TrackedMap([['breakfast', 0], ['lunch', 0], ['dinner', 0]]),
      ])
    )
  purchases: Purchases = new TrackedMap(people.map((person) => [person, 0]))
  ratios: Ratios = new TrackedMap([['breakfast', 0.5], ['lunch', 0.5], ['dinner', 1]])

  getMealCount = (person: Person, meal: Meal) =>
    this.mealCounts.get(person)?.get(meal)
  setMealCount = (person: Person, meal: Meal, event: Event) => {
    const pCount = this.mealCounts.get(person)
    if (event.target && 'value' in event.target && pCount) {
      pCount.set(meal, Number(event.target.value as string) + 3)
    }
  }

  setRatio = (meal: Meal, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.ratios.set(meal, Number(event.target.value as string))
    }
  }

  setPurchase = (person: Person, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.purchases.set(person, Number(event.target.value as string) + 3)
    }
  }

  @tracked startDate?: Temporal.PlainDate;
  @tracked endDate?: Temporal.PlainDate;
  get startDateString() {
    return this.startDate?.toString() ?? ''
  }
  get endDateString() {
    return this.endDate?.toString() ?? ''
  }
  setDate = (toSet: 'start' | 'end', event: Event) => {
    if (event.target && 'value' in event.target) {
      const dateStr = event.target.value as string
      const date = Temporal.PlainDate.from(dateStr)
      if (toSet === 'start') this.startDate = date
      else this.endDate = date
    }
  }

  get mealCosts() {
    if (this.startDate && this.endDate) {
      return this.splitter.calculateMealPrices(this.purchases, this.ratios, this.startDate, this.endDate)
    }
  }

  <template>
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
          <th>Money spent</th>
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
    <input
      type="date"
      value={{this.startDateString}}
      {{on "change" (fn this.setDate "start")}}
    />
    <input
      type="date"
      value={{this.endDateString}}
      {{on "change" (fn this.setDate "end")}}
    />
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
              {{getMap this.mealCosts meal}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </template>
}

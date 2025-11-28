import { get } from '@ember/helper'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import Component from '@glimmer/component'
import { tracked } from 'tracked-built-ins'
import { Temporal } from '@js-temporal/polyfill'
import {
  meals,
  people,
  type Meal,
  type Person,
} from 'off-courses/services/splitter'

export interface BouffeSignature {
  Element: null
}

export default class Bouffe extends Component<BouffeSignature> {
  mealCounts = tracked(
    Object.fromEntries(
      people.map((person) => [
        person,
        tracked({ breakfast: 0, lunch: 0, dinner: 0 }),
      ])
    )
  )
  purchases = tracked(Object.fromEntries(people.map((person) => [person, 0])))
  ratios = tracked({ breakfast: 0.5, lunch: 0.5, dinner: 1 })

  setMealCount = (person: Person, meal: Meal, event: Event) => {
    if (event.target && 'value' in event.target && this.mealCounts[person]) {
      this.mealCounts[person][meal] = Number(event.target.value as string)
    }
  }

  setRatio = (meal: Meal, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.ratios[meal] = Number(event.target.value as string)
    }
  }

  setPurchase = (person: Person, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.purchases[person] = Number(event.target.value as string)
    }
  }

  startDate?: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
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
                  value={{get (get this.mealCounts person) meal}}
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
                value={{get this.purchases person}}
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
                value={{get this.ratios meal}}
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
  </template>
}

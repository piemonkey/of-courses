import { on } from '@ember/modifier'
import { fn, hash } from '@ember/helper'
import { service } from '@ember/service'
import type Owner from '@ember/owner'
import Component from '@glimmer/component'
import { trackedMap } from '@ember/reactive/collections'
import SplitterService, {
  meals,
  people,
  type Meal,
  type MealCounts,
  type Person,
  type Privileges,
  type Purchases,
  type Ratios,
} from 'of-courses/services/splitter'
import saveOnUnload, { loadState } from 'of-courses/modifiers/save-on-unload'

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

  constructor(owner: Owner, args: object) {
    super(owner, args)
    const saved = loadState()
    if (saved.mealCounts) this.mealCounts = saved.mealCounts as MealCounts
    if (saved.purchases) this.purchases = saved.purchases as Purchases
    if (saved.privileges) this.privileges = saved.privileges as Privileges
    if (saved.ratios) this.ratios = saved.ratios as Ratios
  }

  mealCounts: MealCounts = trackedMap(
    people.map((person) => [
      person,
      trackedMap([
        ['breakfast', 0],
        ['lunch', 0],
        ['dinner', 0],
      ]),
    ])
  )
  purchases: Purchases = trackedMap(people.map((person) => [person, 0]))
  privileges: Privileges = trackedMap(people.map((person) => [person, 1]))
  ratios: Ratios = trackedMap([
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

  setPrivilege = (person: Person, event: Event) => {
    if (event.target && 'value' in event.target) {
      this.privileges.set(person, Number(event.target.value as string))
    }
  }

  get mealCosts() {
    return this.splitter.calculateMealPrices(
      this.splitter.calculateMealTotals(this.splitter.privilegeAdjustCounts(this.mealCounts, this.privileges)),
      this.purchases,
      this.ratios
    )
  }

  get debts() {
    if (this.mealCosts) {
      return this.splitter.calculateSpent(this.splitter.privilegeAdjustCounts(this.mealCounts, this.privileges), this.mealCosts)
    }
  }

  calcBalance = (person: Person) =>
    (this.debts?.get(person) ?? 0) - (this.purchases.get(person) ?? 0)
  ;<template>
    <table
      {{saveOnUnload
        (hash
          mealCounts=this.mealCounts purchases=this.purchases privileges=this.privileges ratios=this.ratios
        )
      }}
    >
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
        <tr>
          <th>Privilege factor</th>
          {{#each people as |person|}}
            <td>
              <input
                type="number"
                value={{getMap this.privileges person}}
                {{on "change" (fn this.setPrivilege person)}}
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

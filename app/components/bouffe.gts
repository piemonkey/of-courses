import { get } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';

export interface BouffeSignature {
  Element: null;
}

const people = ['Rich', 'Gaelle', 'Soura', 'Leo', 'Maïlys', 'Gobs'] as const
const meals = ['breakfast', 'lunch', 'dinner'] as const

export default class Bouffe extends Component<BouffeSignature> {
  mealCounts = tracked(Object.fromEntries(people.map((person) => [person, { breakfast: 0, lunch: 0, dinner: 0 }])))
  purchases = tracked(Object.fromEntries(people.map((person) => [person, 0])))
  ratios = tracked({ breakfast: 0.5, lunch: 0.5, dinner: 1 })

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
              <td><input type="number" value={{get (get this.mealCounts person) meal}} /></td>
            {{/each}}
          </tr>
        {{/each}}
        <tr>
          <th>Money spent</th>
          {{#each people as |person|}}
            <td><input type="number" value={{get this.purchases person}} /></td>
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
            <td><input type="number" value={{get this.ratios meal}} /></td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </template>
}

import Service from '@ember/service'
import type { Person, Purchases } from './splitter'

export interface Payment {
  from: Person
  to: Person
  amount: number
}

function sortAmounts(amounts: [Person, number][]) {
  return amounts.sort(([_, a], [__, b]) => a - b)
}

export default class DebtRepayService extends Service {
  repay(balances: Purchases) {
    const repayments: Payment[] = []
    const all = sortAmounts([...balances.entries()])
    let owed = all.filter(([_, amount]) => amount < 0)
    const owe = all.filter(([_, amount]) => amount > 0)
    // Remove easy balances
    owed = owed.filter(([debtee, debit]) => {
      const matchI = owe.findIndex(([_, debt]) => debt === -debit)
      if (~matchI) {
        const debtInfo = owe.splice(matchI, 1)[0]!
        repayments.push({ from: debtInfo[0], to: debtee, amount: -debit })
        return false
      }
      return true
    })
    while (owed.length > 0) {
      const [debtee, debit] = owed.shift()!
      const [debter, debt] = owe.pop()!
      if (-debit > debt) {
        repayments.push({ from: debter, to: debtee, amount: debt })
        owed.unshift([debtee, debit + debt])
      } else {
        repayments.push({ from: debter, to: debtee, amount: -debit })
        owe.push([debter, debt + debit])
      }
    }

    return repayments
  }
}

declare module '@ember/service' {
  interface Registry {
    'debt-repay': DebtRepayService
  }
}

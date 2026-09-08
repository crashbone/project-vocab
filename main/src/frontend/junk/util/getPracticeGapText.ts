// Dashboard'daki karsilama satiri. getDateTitle.ts ile ayni kademeler
// (gun / ay / yil), ama cumle icinde okunacak sekilde bicimlenir.
export const getPracticeGapText = (date: Date | undefined): string => {
  if (!date) {
    return "Let's start practicing!"
  }

  const now = new Date()
  const dayDifference = now.getDate() - date.getDate()
  const monthDifference = now.getMonth() - date.getMonth()
  const yearDifference = now.getFullYear() - date.getFullYear()

  const since = (amount: string) => `It's been ${amount} since you practiced!`

  if (yearDifference < 1) {
    if (monthDifference < 1) {
      if (dayDifference < 1) {
        return 'You practiced today, keep it going!'
      }
      if (dayDifference === 1) {
        return 'You practiced yesterday, nice going!'
      }
      return since(`${dayDifference} days`)
    }
    if (monthDifference === 1) {
      return since('a month')
    }
    return since(`${monthDifference} months`)
  }
  if (yearDifference === 1) {
    return since('a year')
  }
  return since(`${yearDifference} years`)
}

export const getDateTitle = (date: Date) => {
  const now = new Date();

  const currentDay = now.getDate()
    const lastEntryDay = date.getDate()
    const dayDifference = currentDay - lastEntryDay
    
    const currentMonth = now.getMonth()
    const lastEntryMonth = date.getMonth()
    const monthDifference = currentMonth - lastEntryMonth
    
    const currentYear = now.getFullYear()
    const lastEntryYear = date.getFullYear()
    const yearDifference = currentYear - lastEntryYear

    // Note: The logic below is preserved from the original code
    
    if (yearDifference < 1) {
      if (monthDifference < 1) {
        if (dayDifference < 1) {
          return "Today"
        }
        if (dayDifference === 1) {
          return "Yesterday"
        }
        return `${dayDifference} days ago`
      }
      if (monthDifference === 1) {
        return "Last month"
      }
      return `${monthDifference} months ago`
    }
    if (yearDifference === 1) {
      return "Last year"
    }
    return `${yearDifference} years ago`
}
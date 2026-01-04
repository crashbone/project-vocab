export const wordColors = [
  ["rgba(255, 183, 204, 0.6)", "rgba(255, 213, 229, 0.6)"], // Pink
  ["rgba(255, 214, 186, 0.6)", "rgba(255, 233, 218, 0.6)"], // Peach
  ["rgba(203, 223, 227, 0.6)", "rgba(208, 240, 247, 0.6)"]  // Cyan
]

export const setWordColorsAsCSSVariables = () => {
  wordColors.forEach((gradient, index) => {
    const documentRoot = document.documentElement
    documentRoot.style.setProperty(
      `--button-type${((index % 3) + 1)}-bg`,
      `linear-gradient(to bottom, ${gradient.join(", ")})`,
    )
  })
}
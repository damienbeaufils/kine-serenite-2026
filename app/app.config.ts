export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'neutral'
    },
    card: {
      slots: {
        root: 'relative overflow-visible rounded-[4px] bg-white shadow-elevation-2',
        body: 'p-0 sm:p-0'
      },
      variants: {
        variant: {
          outline: {
            root: 'ring-0 divide-y-0'
          }
        }
      }
    }
  }
})

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'neutral'
    },
    card: {
      slots: {
        root: 'relative overflow-visible rounded-[4px] wrap-break-word shadow-elevation-2',
        body: 'p-0 sm:p-0'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-white ring-0 divide-y-0'
          }
        }
      }
    },
    button: {
      slots: {
        base: [
          'relative inline-flex shrink-0 items-center justify-center rounded-[4px] font-medium tracking-[0.0892857143em] indent-[0.0892857143em] whitespace-nowrap uppercase no-underline select-none outline-none',
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:duration-200 before:ease-[cubic-bezier(0.4,0,0.6,1)]',
          'hover:before:opacity-[0.08] focus:before:opacity-[0.24]',
          'disabled:pointer-events-none disabled:opacity-100 aria-disabled:pointer-events-none aria-disabled:opacity-100'
        ]
      },
      variants: {
        size: {
          md: {
            base: 'h-9 min-w-16 gap-0 px-4 py-0 text-sm leading-normal'
          }
        },
        active: {
          true: {
            base: 'before:opacity-[0.18] hover:before:opacity-[0.18]'
          }
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'solid', class: 'bg-kine-green text-white hover:bg-kine-green active:bg-kine-green' },
        { color: 'primary', variant: 'ghost', class: 'bg-transparent text-kine-green hover:bg-transparent active:bg-transparent' },
        { color: 'neutral', variant: 'ghost', class: 'bg-transparent text-[rgba(0,0,0,0.87)] hover:bg-transparent active:bg-transparent disabled:text-[rgba(0,0,0,0.26)] aria-disabled:text-[rgba(0,0,0,0.26)]' }
      ]
    },
    dropdownMenu: {
      slots: {
        content: 'max-w-[80vw] min-w-0 overflow-y-auto rounded-[4px] bg-white py-2 shadow-elevation-8! ring-0',
        group: 'p-0',
        item: 'min-h-12 items-center no-underline before:hidden'
      },
      variants: {
        size: {
          md: {
            item: 'px-4 py-0'
          }
        }
      }
    }
  }
})

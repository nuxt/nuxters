export default defineAppConfig({
  ui: {
    colors: {
        primary: 'green',
        neutral: 'slate'
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'outline',
          class: 'bg-neutral-950 border border-[0.5px] border-primary-400 text-neutral-300 disabled:bg-neutral-700 hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-400 transition-all duration-200'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'bg-linear-to-b from-neutral-800/50 to-neutral-900/50 border border-neutral-700 text-neutral-300 disabled:bg-transparent hover:bg-neutral-900 disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-neutral-400 transition-color duration-200',
          link: 'text-neutral-300 hover:text-neutral-200 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-300'
        },
        {
          color: 'neutral',
          variant: 'link',
          class: 'text-neutral-300 hover:text-neutral-200 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-300'
        },
      ]
    },
    badge: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'bg-primary-400/10 text-primary-400 ring-1 ring-inset ring-primary-400 ring-opacity-10 dark:ring-opacity-20'
        }
      ],
      variants: {
        size: {
          md: 'text-base px-2 py-1',
        },
      }
    },
  },
})

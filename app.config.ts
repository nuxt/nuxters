export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',

    button: {
      color: {
        gray: {
          outline: 'bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700 text-gray-300 disabled:bg-transparent hover:bg-gray-900 disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-400',
          link: 'text-gray-300 hover:text-gray-200 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-300'
        },
      }
    }
  },
})

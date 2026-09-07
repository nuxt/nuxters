import { createPeopleDirectory } from '#shared/utils/people'
import peopleMap from '~~/public/people.json'

// Immutable build-time data. No request or session state is stored here.
export const peopleDirectory = createPeopleDirectory(peopleMap)

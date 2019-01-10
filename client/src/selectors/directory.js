import { createSelector } from 'reselect'

export const getEntities = createSelector(
  state => state.screens.directory.listHashes,
  state => state.entities.metadata,
  (listHashes, metadata) => listHashes.map(hash => metadata[hash]).filter(obj => !!obj)
)

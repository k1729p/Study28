import { RepositoryType } from '../repositories/repository-type.js';
/**
 * Maps the string to the RepositoryType enumeration member.
 * @param value the value
 * @returns repositoryType
 */
export const getRepositoryType = (value?: any): RepositoryType => {
  const match = Object.values(RepositoryType).find(
    repositoryType => repositoryType.toLowerCase() === String(value).toLowerCase()
  );
  return match || RepositoryType.PostgreSQL;
};
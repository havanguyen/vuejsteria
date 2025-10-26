export const getRolesFromScope = (scopeString) => {
  if (!scopeString) return [];
  return scopeString
    .split(' ')
    .filter(scope => scope.startsWith('ROLE_'))
    .map(role => role.replace('ROLE_', ''));
};
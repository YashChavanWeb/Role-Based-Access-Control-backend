// check for the user rights
const isOwner = (user, doc) => doc.ownerId?.toString() === user.userId;
const isHead = (user) => user.role === 'Head';
const sameTeam = (user, doc) => doc.team === user.team || doc.sharedWithTeam === user.team;

// make rules
const rules = {
  // manager
  manager: {
    view: (user, doc) => doc.sharedWithTeam === user.team,
    edit: (user, doc) => sameTeam(user, doc) && doc.editAccessRoles.includes(user.role),

    // No one can delete manager documents except himself
    delete: () => false,
  },

  // employee
  employee: {
    view: (user, doc) => doc.team === user.team,

    edit: (user, doc) =>
      // only if same team and is head of that team
      sameTeam(user, doc) && (doc.editAccessRoles.includes(user.role) || isHead(user)),

    // can delete only if head
    delete: (user, doc) => sameTeam(user, doc) && isHead(user),
  },
};

// check permissions function

const checkPermissions = (user, doc, action) => {
  const owner = isOwner(user, doc);

  // only owner can edit or delete
  if (action === 'edit' || action === 'delete') {
    if (owner) return { allowed: true };
  }

  // rule check from the list
  const ruleSet = rules[doc.sender];
  if (!ruleSet || typeof ruleSet[action] !== 'function') {
    return { allowed: false, reason: 'Unknown permission rule' };
  }

  // if allowed for the rule then allow it
  const allowed = ruleSet[action](user, doc);
  return allowed ? { allowed: true } : { allowed: false, reason: 'Insufficient permissions' };
};

export default checkPermissions;

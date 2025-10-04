// Reusable filtering functions for Friends module (DRY)
// Each function receives raw data and filter criteria objects.

// Text match helper
const matchesSearch = (text = '', term = '') => text.toLowerCase().includes(term.toLowerCase());

export const filterSuggestions = (suggestions = [], { term = '', filters = [] } = {}) => {
  let list = suggestions.filter(s =>
    matchesSearch(s.firstName || '', term) ||
    matchesSearch(s.lastName || '', term) ||
    matchesSearch(s.email || '', term)
  );

  if (filters.length) {
    list = list.filter(s => {
      return filters.every(f => {
        switch (f) {
          case 'hasAccess':
            return !!(s.friendship && (s.friendship.requesterAccess !== 'NONE' || s.friendship.recipientAccess !== 'NONE'));
          case 'noAccess':
            return !(s.friendship && (s.friendship.requesterAccess !== 'NONE' || s.friendship.recipientAccess !== 'NONE'));
          case 'firstNameA':
            return (s.firstName || '').charAt(0).toUpperCase() >= 'A' && (s.firstName || '').charAt(0).toUpperCase() <= 'M';
          case 'firstNameN':
            return (s.firstName || '').charAt(0).toUpperCase() >= 'N' && (s.firstName || '').charAt(0).toUpperCase() <= 'Z';
          default:
            return true;
        }
      });
    });
  }
  return list;
};

export const filterRequests = (requests = [], { term = '', filters = [] } = {}) => {
  let list = requests.filter(r =>
    matchesSearch(r.requester.firstName || '', term) ||
    matchesSearch(r.requester.lastName || '', term) ||
    matchesSearch(r.requester.email || '', term)
  );
  const now = Date.now();
  if (filters.length) {
    list = list.filter(r => {
      return filters.every(f => {
        switch (f) {
          case 'incoming':
            // All current requests are incoming to the user; keep logic for extensibility
            return true;
          case 'recent':
            return now - new Date(r.createdAt || r.updatedAt || now).getTime() < 7 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    });
  }
  return list;
};

export const normalizeFriends = (friends = []) =>
  friends.map(fr => {
    const other = fr.recipient; // Assuming recipient is always the other user
    if (other) other.friendship = fr;
    return other;
  }).filter(Boolean);

export const filterFriends = (friends = [], { term = '', filters = [], userId } = {}) => {
  let list = normalizeFriends(friends).filter(f =>
    matchesSearch(f.firstName || '', term) ||
    matchesSearch(f.lastName || '', term) ||
    matchesSearch(f.email || '', term)
  );
  if (filters.length) {
    list = list.filter(f => {
      return filters.every(fl => {
        const friendship = f.friendship;
        switch (fl) {
          case 'withAccess':
            return friendship && (friendship.requesterAccess !== 'NONE' || friendship.recipientAccess !== 'NONE');
          case 'mutualFull':
            return friendship && friendship.requesterAccess === 'FULL' && friendship.recipientAccess === 'FULL';
          case 'noAccess':
            return !(friendship && (friendship.requesterAccess !== 'NONE' || friendship.recipientAccess !== 'NONE'));
          default:
            return true;
        }
      });
    });
  }
  return list;
};

export const buildSharedCombined = ({ incoming = [], outgoing = [], viewMode = 'combined', filter = 'all', sort = 'name', term = '' }) => {
  const lower = term.toLowerCase();
  const match = u => !lower || (u.name && u.name.toLowerCase().includes(lower)) || (u.email && u.email.toLowerCase().includes(lower));
  const inc = incoming.filter(match).map(u => ({ ...u, _direction: 'incoming' }));
  const out = outgoing.filter(match).map(u => ({ ...u, _direction: 'outgoing' }));

  if (viewMode === 'combined') {
    let combo = [...inc, ...out];
    if (filter !== 'all') combo = combo.filter(c => c._direction === filter);
    combo.sort((a,b) => {
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
      return (a.accessLevel || 'NONE').localeCompare(b.accessLevel || 'NONE');
    });
    return { combined: combo };
  }
  return { incoming: inc, outgoing: out };
};

export const filterSharedBySelectedFilters = (items = [], selected = []) => {
  if (!selected.length) return items;
  return items.filter(it => selected.every(f => {
    switch (f) {
      case 'incoming':
        return it._direction === 'incoming';
      case 'outgoing':
        return it._direction === 'outgoing';
      case 'read':
        return it.accessLevel === 'READ';
      case 'write':
        return it.accessLevel === 'WRITE';
      case 'full':
        return it.accessLevel === 'FULL';
      case 'none':
        return it.accessLevel === 'NONE';
      default:
        return true;
    }
  }));
};

export default {
  filterSuggestions,
  filterRequests,
  filterFriends,
  buildSharedCombined,
  filterSharedBySelectedFilters,
  normalizeFriends
};

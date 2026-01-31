import { SHARES_ACTION_TYPES } from "./shares.actionTypes";

const initialState = {
  // List of user's shares
  myShares: [],
  mySharesLoading: false,
  mySharesError: null,

  // Currently created/viewing share
  currentShare: null,
  createShareLoading: false,
  createShareError: null,

  // Shared data being viewed (from token access)
  sharedData: null,
  sharedDataLoading: false,
  sharedDataError: null,

  // Paginated shared data
  paginatedData: {
    // Share metadata
    isValid: null,
    permission: null,
    resourceType: null,
    expiresAt: null,
    owner: null,
    shareName: null,
    totalCount: 0,
    countsByType: {},
    token: null,
    // Current tab/type
    activeResourceType: "EXPENSE",
    // Current search query
    currentSearch: "",
    // Paginated items per type
    itemsByType: {
      EXPENSE: {
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
      CATEGORY: {
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
      BUDGET: {
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
      BILL: {
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
      PAYMENT_METHOD: {
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
    },
    warnings: [],
  },
  paginatedDataLoading: false,
  paginatedDataError: null,
  loadMoreLoading: false,

  // User added items (persistent tracking)
  addedItems: {
    // Map of token -> Set of added external refs
    byToken: {},
    loading: false,
    error: null,
  },

  // Share validation
  validation: null,
  validationLoading: false,

  // Share statistics
  stats: null,
  statsLoading: false,

  // Revoke state
  revokeLoading: false,
  revokeError: null,

  // General error
  error: null,
};

const sharesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Create share
    case SHARES_ACTION_TYPES.CREATE_SHARE_REQUEST:
      return {
        ...state,
        createShareLoading: true,
        createShareError: null,
      };
    case SHARES_ACTION_TYPES.CREATE_SHARE_SUCCESS:
      return {
        ...state,
        createShareLoading: false,
        currentShare: action.payload,
        // Add to myShares list
        myShares: [action.payload, ...state.myShares],
      };
    case SHARES_ACTION_TYPES.CREATE_SHARE_FAILURE:
      return {
        ...state,
        createShareLoading: false,
        createShareError: action.payload,
      };

    // Access share
    case SHARES_ACTION_TYPES.ACCESS_SHARE_REQUEST:
      return {
        ...state,
        sharedDataLoading: true,
        sharedDataError: null,
      };
    case SHARES_ACTION_TYPES.ACCESS_SHARE_SUCCESS:
      return {
        ...state,
        sharedDataLoading: false,
        sharedData: action.payload,
      };
    case SHARES_ACTION_TYPES.ACCESS_SHARE_FAILURE:
      return {
        ...state,
        sharedDataLoading: false,
        sharedDataError: action.payload,
      };

    // Validate share
    case SHARES_ACTION_TYPES.VALIDATE_SHARE_REQUEST:
      return {
        ...state,
        validationLoading: true,
      };
    case SHARES_ACTION_TYPES.VALIDATE_SHARE_SUCCESS:
      return {
        ...state,
        validationLoading: false,
        validation: action.payload,
      };
    case SHARES_ACTION_TYPES.VALIDATE_SHARE_FAILURE:
      return {
        ...state,
        validationLoading: false,
        validation: { valid: false, invalidReason: action.payload },
      };

    // Revoke share
    case SHARES_ACTION_TYPES.REVOKE_SHARE_REQUEST:
      return {
        ...state,
        revokeLoading: true,
        revokeError: null,
      };
    case SHARES_ACTION_TYPES.REVOKE_SHARE_SUCCESS:
      return {
        ...state,
        revokeLoading: false,
        // Update the share in myShares to show as revoked
        myShares: state.myShares.map((share) =>
          share.token === action.payload
            ? { ...share, isActive: false, status: "REVOKED" }
            : share,
        ),
        // Clear current share if it was revoked
        currentShare:
          state.currentShare?.token === action.payload
            ? null
            : state.currentShare,
      };
    case SHARES_ACTION_TYPES.REVOKE_SHARE_FAILURE:
      return {
        ...state,
        revokeLoading: false,
        revokeError: action.payload,
      };

    // Fetch my shares
    case SHARES_ACTION_TYPES.FETCH_MY_SHARES_REQUEST:
      return {
        ...state,
        mySharesLoading: true,
        mySharesError: null,
      };
    case SHARES_ACTION_TYPES.FETCH_MY_SHARES_SUCCESS:
      return {
        ...state,
        mySharesLoading: false,
        myShares: action.payload,
      };
    case SHARES_ACTION_TYPES.FETCH_MY_SHARES_FAILURE:
      return {
        ...state,
        mySharesLoading: false,
        mySharesError: action.payload,
      };

    // Fetch share stats
    case SHARES_ACTION_TYPES.FETCH_SHARE_STATS_REQUEST:
      return {
        ...state,
        statsLoading: true,
      };
    case SHARES_ACTION_TYPES.FETCH_SHARE_STATS_SUCCESS:
      return {
        ...state,
        statsLoading: false,
        stats: action.payload,
      };
    case SHARES_ACTION_TYPES.FETCH_SHARE_STATS_FAILURE:
      return {
        ...state,
        statsLoading: false,
      };

    // Regenerate QR
    case SHARES_ACTION_TYPES.REGENERATE_QR_REQUEST:
      return state;
    case SHARES_ACTION_TYPES.REGENERATE_QR_SUCCESS:
      return {
        ...state,
        // Update current share if it matches
        currentShare:
          state.currentShare?.token === action.payload.token
            ? {
                ...state.currentShare,
                qrCodeDataUri: action.payload.qrCodeDataUri,
              }
            : state.currentShare,
        // Update in myShares
        myShares: state.myShares.map((share) =>
          share.token === action.payload.token
            ? { ...share, qrCodeDataUri: action.payload.qrCodeDataUri }
            : share,
        ),
      };
    case SHARES_ACTION_TYPES.REGENERATE_QR_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    // Clear states
    case SHARES_ACTION_TYPES.CLEAR_SHARE_ERROR:
      return {
        ...state,
        error: null,
        createShareError: null,
        sharedDataError: null,
        revokeError: null,
        mySharesError: null,
      };
    case SHARES_ACTION_TYPES.CLEAR_CURRENT_SHARE:
      return {
        ...state,
        currentShare: null,
        createShareError: null,
      };
    case SHARES_ACTION_TYPES.CLEAR_SHARED_DATA:
      return {
        ...state,
        sharedData: null,
        sharedDataError: null,
        validation: null,
      };

    // Share with friend
    case SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_REQUEST:
      return {
        ...state,
        shareWithFriendLoading: true,
        shareWithFriendError: null,
      };
    case SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_SUCCESS:
      return {
        ...state,
        shareWithFriendLoading: false,
      };
    case SHARES_ACTION_TYPES.SHARE_WITH_FRIEND_FAILURE:
      return {
        ...state,
        shareWithFriendLoading: false,
        shareWithFriendError: action.payload,
      };

    // ========== Paginated Access ==========
    case SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_REQUEST:
      return {
        ...state,
        paginatedDataLoading: true,
        paginatedDataError: null,
      };
    case SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_SUCCESS: {
      const {
        token,
        resourceType,
        pagedItems,
        countsByType,
        search,
        ...metadata
      } = action.payload;
      const newItemsByType = { ...state.paginatedData.itemsByType };

      // If pagedItems is provided, update that type's data
      if (pagedItems) {
        newItemsByType[pagedItems.resourceType] = {
          items: pagedItems.items || [],
          page: pagedItems.page || 0,
          totalPages: pagedItems.totalPages || 0,
          totalItems: pagedItems.totalItems || 0,
          hasMore: pagedItems.hasMore || false,
        };
      }

      return {
        ...state,
        paginatedDataLoading: false,
        paginatedData: {
          ...state.paginatedData,
          ...metadata,
          token,
          countsByType: countsByType || state.paginatedData.countsByType,
          itemsByType: newItemsByType,
          currentSearch: search || "",
          activeResourceType:
            resourceType !== "ALL"
              ? resourceType
              : state.paginatedData.activeResourceType,
        },
      };
    }
    case SHARES_ACTION_TYPES.ACCESS_SHARE_PAGINATED_FAILURE:
      return {
        ...state,
        paginatedDataLoading: false,
        paginatedDataError: action.payload,
      };

    case SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_REQUEST:
      return {
        ...state,
        loadMoreLoading: true,
      };
    case SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_SUCCESS: {
      const { resourceType, pagedItems } = action.payload;
      if (!pagedItems) return { ...state, loadMoreLoading: false };

      const currentTypeData = state.paginatedData.itemsByType[resourceType] || {
        items: [],
      };

      return {
        ...state,
        loadMoreLoading: false,
        paginatedData: {
          ...state.paginatedData,
          itemsByType: {
            ...state.paginatedData.itemsByType,
            [resourceType]: {
              items: [...currentTypeData.items, ...(pagedItems.items || [])],
              page: pagedItems.page || 0,
              totalPages: pagedItems.totalPages || 0,
              totalItems: pagedItems.totalItems || 0,
              hasMore: pagedItems.hasMore || false,
            },
          },
        },
      };
    }
    case SHARES_ACTION_TYPES.LOAD_MORE_SHARED_ITEMS_FAILURE:
      return {
        ...state,
        loadMoreLoading: false,
        paginatedDataError: action.payload,
      };

    case SHARES_ACTION_TYPES.SET_ACTIVE_RESOURCE_TAB:
      return {
        ...state,
        paginatedData: {
          ...state.paginatedData,
          activeResourceType: action.payload,
        },
      };

    // ========== User Added Items Tracking ==========
    case SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_REQUEST:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: true,
          error: null,
        },
      };
    case SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_SUCCESS: {
      const { token, addedExternalRefs } = action.payload;
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          byToken: {
            ...state.addedItems.byToken,
            [token]: new Set(addedExternalRefs || []),
          },
        },
      };
    }
    case SHARES_ACTION_TYPES.FETCH_ADDED_ITEMS_FAILURE:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          error: action.payload,
        },
      };

    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_REQUEST:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: true,
        },
      };
    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_SUCCESS: {
      const { token, externalRef, alreadyAdded } = action.payload;
      const currentSet = state.addedItems.byToken[token] || new Set();
      const newSet = new Set(currentSet);
      newSet.add(externalRef);

      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          byToken: {
            ...state.addedItems.byToken,
            [token]: newSet,
          },
        },
      };
    }
    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEM_FAILURE:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          error: action.payload,
        },
      };

    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_REQUEST:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: true,
        },
      };
    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_SUCCESS: {
      const { token, items } = action.payload;
      const currentSet = state.addedItems.byToken[token] || new Set();
      const newSet = new Set(currentSet);
      items.forEach((ref) => newSet.add(ref));

      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          byToken: {
            ...state.addedItems.byToken,
            [token]: newSet,
          },
        },
      };
    }
    case SHARES_ACTION_TYPES.TRACK_ADDED_ITEMS_BULK_FAILURE:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          error: action.payload,
        },
      };

    case SHARES_ACTION_TYPES.UNTRACK_ITEM_REQUEST:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: true,
        },
      };
    case SHARES_ACTION_TYPES.UNTRACK_ITEM_SUCCESS: {
      const { token, externalRef } = action.payload;
      const currentSet = state.addedItems.byToken[token] || new Set();
      const newSet = new Set(currentSet);
      newSet.delete(externalRef);

      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          byToken: {
            ...state.addedItems.byToken,
            [token]: newSet,
          },
        },
      };
    }
    case SHARES_ACTION_TYPES.UNTRACK_ITEM_FAILURE:
      return {
        ...state,
        addedItems: {
          ...state.addedItems,
          loading: false,
          error: action.payload,
        },
      };

    default:
      return state;
  }
};

export default sharesReducer;

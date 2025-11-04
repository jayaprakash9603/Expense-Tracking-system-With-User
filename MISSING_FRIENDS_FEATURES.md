# Missing Features in Friends Component

## ✅ Completed Redux Implementation

All Redux actions, action types, and reducer cases have been added for the missing backend features.

## 📋 Backend Features Analysis

### Already Implemented in Frontend ✓

1. **Send Friend Request** - `POST /request`
2. **Respond to Request** - `PUT /{friendshipId}/respond`
3. **Get Friend Suggestions** - `GET /suggestions`
4. **Get Incoming Requests** - `GET /pending/incoming`
5. **Fetch Friends** - `GET /friends`
6. **Set Access Level** - `PUT /{friendshipId}/access`
7. **Fetch I Shared With** - `GET /i-shared-with`
8. **Fetch Shared With Me** - `GET /shared-with-me`
9. **Get Friendship Details** - `GET /details`

### Missing from Frontend UI (Now with Redux Support) ❌

#### 1. **Cancel Outgoing Friend Request**

- **Backend**: `DELETE /request/{friendshipId}/cancel`
- **Redux Action**: `cancelFriendRequest(friendshipId)`
- **UI Location**: Should be in "Requests" tab -> "Outgoing" section
- **Use Case**: User wants to cancel a pending friend request they sent

#### 2. **Remove Friendship (Unfriend)**

- **Backend**: `DELETE /{friendshipId}`
- **Redux Action**: `removeFriendship(friendshipId)`
- **UI Location**: Should be in "Friends" tab -> Friend options menu
- **Use Case**: User wants to remove an existing friend

#### 3. **Block User**

- **Backend**: `POST /block/{userId}`
- **Redux Action**: `blockUser(userId)`
- **UI Location**: Should be in friend options menu or suggestion menu
- **Use Case**: User wants to block another user

#### 4. **Unblock User**

- **Backend**: `POST /unblock/{userId}`
- **Redux Action**: `unblockUser(userId)`
- **UI Location**: New "Blocked Users" tab
- **Use Case**: User wants to unblock a previously blocked user

#### 5. **View Blocked Users**

- **Backend**: `GET /blocked`
- **Redux Action**: `fetchBlockedUsers()`
- **UI Location**: New "Blocked Users" tab
- **Use Case**: User wants to see all blocked users

#### 6. **Friendship Stats Dashboard**

- **Backend**: `GET /stats`
- **Redux Action**: `fetchFriendshipStats()`
- **UI Location**: Top of Friends page or new "Stats" card
- **Use Case**: Show overview (total friends, pending, blocked count)
- **Data Returned**:
  ```json
  {
    "totalFriends": 10,
    "incomingRequests": 3,
    "outgoingRequests": 2,
    "blockedUsers": 1
  }
  ```

#### 7. **View Outgoing Requests**

- **Backend**: `GET /pending/outgoing`
- **Redux Action**: `fetchOutgoingRequests()`
- **UI Location**: "Requests" tab -> "Outgoing" sub-section
- **Use Case**: User wants to see friend requests they've sent

#### 8. **Search Friends**

- **Backend**: `GET /search?query={query}`
- **Redux Action**: `searchFriends(query)`
- **UI Location**: Friends tab search bar
- **Use Case**: Search within existing friends list

#### 9. **View Mutual Friends**

- **Backend**: `GET /mutual/{userId}`
- **Redux Action**: `fetchMutualFriends(userId)`
- **UI Location**: Friend detail view or suggestion card
- **Use Case**: Show mutual friends with a user

#### 10. **Expense Sharing Summary**

- **Backend**: `GET /expense-sharing-summary`
- **Redux Action**: `fetchExpenseSharingSummary()`
- **UI Location**: "Shared" tab header or summary card
- **Use Case**: Show sharing statistics
- **Data Returned**:
  ```json
  {
    "totalFriends": 10,
    "sharedWithMe": 5,
    "iSharedWith": 7,
    "notSharedYet": 3
  }
  ```

#### 11. **Quick Share Expenses**

- **Backend**: `PUT /quick-share/{userId}?accessLevel={level}`
- **Redux Action**: `quickShareExpenses(userId, accessLevel)`
- **UI Location**: Friend detail view quick-action button
- **Use Case**: Quickly set sharing permission for a friend

#### 12. **Batch Share Expenses**

- **Backend**: `POST /batch-share`
- **Redux Action**: `batchShareExpenses(requests)`
- **UI Location**: Friends tab -> "Share with Multiple" button
- **Use Case**: Set sharing permissions for multiple friends at once
- **Request Format**:
  ```json
  [
    { "userId": 1, "accessLevel": "READ" },
    { "userId": 2, "accessLevel": "WRITE" }
  ]
  ```

#### 13. **Get Recommended to Share**

- **Backend**: `GET /recommended-to-share`
- **Redux Action**: `fetchRecommendedToShare()`
- **UI Location**: "Shared" tab -> "Recommended" section
- **Use Case**: Show friends the user hasn't shared expenses with yet

#### 14. **Check Expense Access**

- **Backend**: `GET /access-check/{userId}`
- **Use Case**: Backend validation (might not need UI)

#### 15. **Check if Are Friends**

- **Backend**: `GET /are-friends/{userId1}/{userId2}`
- **Use Case**: Backend validation (might not need UI)

#### 16. **Get Friendship by ID**

- **Backend**: `GET /{friendshipId}`
- **Use Case**: Backend validation (might not need UI)

## 🎨 Recommended UI Enhancements

### 1. Add "Blocked Users" Tab

```jsx
<Tab label="Blocked" icon={<BlockIcon />} />
```

### 2. Add Friendship Stats Card

```jsx
<Card>
  <CardContent>
    <Typography variant="h6">Friendship Stats</Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography>Total Friends: {stats?.totalFriends}</Typography>
        <Typography>Incoming Requests: {stats?.incomingRequests}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography>Outgoing Requests: {stats?.outgoingRequests}</Typography>
        <Typography>Blocked Users: {stats?.blockedUsers}</Typography>
      </Grid>
    </Grid>
  </CardContent>
</Card>
```

### 3. Add Outgoing Requests Section in Requests Tab

```jsx
// In Requests Tab
<Tabs value={requestSubTab}>
  <Tab label="Incoming" />
  <Tab label="Outgoing" />
</Tabs>
```

### 4. Add More Options Menu to Friends

```jsx
<IconButton onClick={(e) => handleFriendMenu(e, friend)}>
  <MoreVertIcon />
</IconButton>
<Menu>
  <MenuItem onClick={() => handleUnfriend(friend.id)}>
    <PersonRemoveIcon /> Unfriend
  </MenuItem>
  <MenuItem onClick={() => handleBlock(friend.userId)}>
    <BlockIcon /> Block
  </MenuItem>
  <MenuItem onClick={() => handleViewMutual(friend.userId)}>
    <PeopleIcon /> View Mutual Friends
  </MenuItem>
</Menu>
```

### 5. Add Batch Share Button

```jsx
<Button startIcon={<ShareIcon />} onClick={handleBatchShareDialog}>
  Share with Multiple
</Button>
```

### 6. Add Expense Sharing Summary

```jsx
<Card>
  <CardContent>
    <Typography variant="h6">Sharing Summary</Typography>
    <Typography>Friends who shared with me: {summary?.sharedWithMe}</Typography>
    <Typography>Friends I shared with: {summary?.iSharedWith}</Typography>
    <Typography>Not shared yet: {summary?.notSharedYet}</Typography>
  </CardContent>
</Card>
```

### 7. Add Recommended to Share Section

```jsx
// In Shared Tab
<Typography variant="h6">Recommended to Share</Typography>
<List>
  {recommendedToShare.map(friend => (
    <ListItem key={friend.userId}>
      <ListItemText primary={friend.name} />
      <Button onClick={() => handleQuickShare(friend.userId)}>
        Share
      </Button>
    </ListItem>
  ))}
</List>
```

## 📝 Implementation Priority

### High Priority (Core User Features)

1. ✅ Cancel Outgoing Request
2. ✅ Remove Friendship (Unfriend)
3. ✅ View Outgoing Requests
4. ✅ Block/Unblock User
5. ✅ View Blocked Users

### Medium Priority (Enhanced UX)

6. ✅ Friendship Stats
7. ✅ Search Friends
8. ✅ Mutual Friends
9. ✅ Expense Sharing Summary

### Low Priority (Advanced Features)

10. ✅ Quick Share
11. ✅ Batch Share
12. ✅ Recommended to Share

## 🔧 Next Steps

1. **Update Friends.jsx Component**:

   - Add new tab for "Blocked Users"
   - Add outgoing requests section
   - Add friendship stats card
   - Add friend options menu (unfriend, block)
   - Add batch share dialog
   - Add recommended to share section

2. **Import New Actions**:

```javascript
import {
  cancelFriendRequest,
  removeFriendship,
  blockUser,
  unblockUser,
  fetchBlockedUsers,
  fetchFriendshipStats,
  fetchOutgoingRequests,
  searchFriends,
  fetchMutualFriends,
  fetchExpenseSharingSummary,
  quickShareExpenses,
  batchShareExpenses,
  fetchRecommendedToShare,
} from "../../Redux/Friends/friendsActions";
```

3. **Add State Selectors**:

```javascript
const {
  blockedUsers,
  loadingBlockedUsers,
  outgoingRequests,
  loadingOutgoingRequests,
  friendshipStats,
  expenseSharingSummary,
  recommendedToShare,
  mutualFriends,
} = useSelector((state) => state.friends || {});
```

4. **Implement Handler Functions**:
   - `handleCancelRequest(friendshipId)`
   - `handleUnfriend(friendshipId)`
   - `handleBlock(userId)`
   - `handleUnblock(userId)`
   - `handleQuickShare(userId, accessLevel)`
   - `handleBatchShare(selectedFriends)`
   - `handleSearchFriends(query)`
   - `handleViewMutual(userId)`

## ✅ Completed

- ✅ Redux action types added
- ✅ Redux actions implemented
- ✅ Redux reducer updated with all cases
- ⏳ UI Components (pending)
- ⏳ Event handlers (pending)
- ⏳ Testing (pending)

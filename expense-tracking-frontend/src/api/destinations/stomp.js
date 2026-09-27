/**
 * STOMP destination catalog — mirrors the endpoint catalog idea for realtime.
 */

export const STOMP_DESTINATIONS = Object.freeze({
  chat: {
    subscribe: {
      oneToOne: "/user/queue/chats",
      typing: "/user/queue/typing",
      presence: "/topic/presence",
    },
    publish: {
      oneToOne: "/app/send/one-to-one",
      group: "/app/send/group",
      markReadBatch: "/app/mark-read-batch",
    },
  },
  notifications: {
    subscribe: {
      user: (userId) => `/topic/user/${userId}/notifications`,
    },
    publish: {
      subscribe: "/app/notifications/subscribe",
    },
  },
  stories: {
    subscribe: {
      global: "/topic/stories/global",
      user: (userId) => `/topic/stories/user/${userId}`,
    },
  },
});

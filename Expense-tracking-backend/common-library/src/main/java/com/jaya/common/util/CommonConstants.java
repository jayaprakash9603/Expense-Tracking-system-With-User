package com.jaya.common.util;




public final class CommonConstants {

    private CommonConstants() {
        
    }

    
    
    

    public static final class KafkaTopics {
        public static final String UNIFIED_ACTIVITY_EVENTS = "unified-activity-events";
        public static final String AUDIT_EVENTS = "audit-events";
        public static final String FRIEND_REQUEST_EVENTS = "friend-request-events";
        public static final String FRIEND_ACTIVITY_EVENTS = "friend-activity-events";
        public static final String NOTIFICATION_EVENTS = "notification-events";
        public static final String EXPENSE_EVENTS = "expense-events";
        public static final String BUDGET_EVENTS = "budget-events";
        public static final String BILL_EVENTS = "bill-events";
        public static final String CATEGORY_EVENTS = "category-events";
        public static final String PAYMENT_METHOD_EVENTS = "payment-method-events";

        private KafkaTopics() {
        }
    }

    
    
    

    public static final class Headers {
        public static final String AUTHORIZATION = "Authorization";
        public static final String BEARER_PREFIX = "Bearer ";
        public static final String X_USER_ID = "X-User-Id";
        public static final String X_USER_EMAIL = "X-User-Email";
        public static final String X_USER_ROLE = "X-User-Role";
        public static final String X_CORRELATION_ID = "X-Correlation-Id";
        public static final String X_REQUEST_ID = "X-Request-Id";
        public static final String X_TRACE_ID = "X-Trace-Id";
        public static final String X_SERVICE_NAME = "X-Service-Name";
        public static final String CONTENT_TYPE = "Content-Type";
        public static final String APPLICATION_JSON = "application/json";

        private Headers() {
        }
    }

    
    
    

    public static final class DateFormats {
        public static final String ISO_DATE_TIME = "yyyy-MM-dd'T'HH:mm:ss";
        public static final String ISO_DATE = "yyyy-MM-dd";
        public static final String ISO_TIME = "HH:mm:ss";
        public static final String DISPLAY_DATE = "MMM dd, yyyy";
        public static final String DISPLAY_DATE_TIME = "MMM dd, yyyy HH:mm";

        private DateFormats() {
        }
    }

    
    
    

    public static final class Pagination {
        public static final int DEFAULT_PAGE = 0;
        public static final int DEFAULT_SIZE = 20;
        public static final int MAX_SIZE = 100;
        public static final String DEFAULT_SORT_FIELD = "createdAt";
        public static final String DEFAULT_SORT_DIRECTION = "DESC";

        private Pagination() {
        }
    }

    
    
    

    public static final class Validation {
        public static final int NAME_MIN_LENGTH = 1;
        public static final int NAME_MAX_LENGTH = 100;
        public static final int DESCRIPTION_MAX_LENGTH = 500;
        public static final int EMAIL_MAX_LENGTH = 255;
        public static final int PASSWORD_MIN_LENGTH = 8;
        public static final int PASSWORD_MAX_LENGTH = 128;
        public static final double MIN_AMOUNT = 0.01;
        public static final double MAX_AMOUNT = 999999999.99;

        private Validation() {
        }
    }

    
    
    

    public static final class CacheKeys {
        public static final String USER_PREFIX = "user:";
        public static final String EXPENSE_PREFIX = "expense:";
        public static final String BUDGET_PREFIX = "budget:";
        public static final String CATEGORY_PREFIX = "category:";
        public static final String NOTIFICATION_PREFIX = "notification:";

        private CacheKeys() {
        }
    }

    
    
    

    public static final class Services {
        public static final String USER_SERVICE = "USER-SERVICE";
        public static final String EXPENSE_SERVICE = "EXPENSE-TRACKING-SYSTEM";
        public static final String BUDGET_SERVICE = "BUDGET-SERVICE";
        public static final String BILL_SERVICE = "BILL-SERVICE";
        public static final String CATEGORY_SERVICE = "CATEGORY-SERVICE";
        public static final String PAYMENT_METHOD_SERVICE = "PAYMENT-METHOD-SERVICE";
        public static final String NOTIFICATION_SERVICE = "NOTIFICATION-SERVICE";
        public static final String FRIENDSHIP_SERVICE = "FRIENDSHIP-SERVICE";
        public static final String AUDIT_SERVICE = "AUDIT-SERVICE";
        public static final String GATEWAY = "API-GATEWAY";
        public static final String SEARCH_SERVICE = "SEARCH-SERVICE";
        public static final String ANALYTICS_SERVICE = "ANALYTICS-SERVICE";

        private Services() {
        }
    }

    
    
    

    public static final class Roles {
        public static final String ROLE_PREFIX = "ROLE_";
        public static final String USER = "USER";
        public static final String ADMIN = "ADMIN";
        public static final String MANAGER = "MANAGER";
        public static final String ROLE_USER = ROLE_PREFIX + USER;
        public static final String ROLE_ADMIN = ROLE_PREFIX + ADMIN;
        public static final String ROLE_MANAGER = ROLE_PREFIX + MANAGER;

        private Roles() {
        }
    }
}

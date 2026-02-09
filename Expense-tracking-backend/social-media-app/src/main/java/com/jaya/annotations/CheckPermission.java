package com.jaya.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CheckPermission {
    boolean needWriteAccess() default false;
    String targetIdParam() default "targetId";
    String jwtParam() default "jwt";
}
package com.example.iusj_user_service.annotation;

import com.example.iusj_user_service.entities.AuditLog;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited {
    AuditLog.AuditAction action();
    String entityType();
}

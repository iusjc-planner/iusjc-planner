package com.example.iusj_user_service.aspect;

import com.example.iusj_user_service.annotation.Audited;
import com.example.iusj_user_service.services.AuditService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Component
public class AuditAspect {

    private final AuditService auditService;

    public AuditAspect(AuditService auditService) {
        this.auditService = auditService;
    }

    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        Object result = joinPoint.proceed();

        Long entityId = extractEntityId(joinPoint.getArgs(), result);
        String details = buildDetails(joinPoint, result);

        auditService.log(audited.action(), audited.entityType(), entityId, details);
        return result;
    }

    private Long extractEntityId(Object[] args, Object result) {
        if (result != null) {
            Long idFromResult = tryGetId(result);
            if (idFromResult != null) {
                return idFromResult;
            }

            if (result instanceof java.util.Optional<?> opt && opt.isPresent()) {
                Long idFromOptional = tryGetId(opt.get());
                if (idFromOptional != null) {
                    return idFromOptional;
                }
            }
        }

        for (Object arg : args) {
            if (arg instanceof Long id) {
                return id;
            }
        }

        return null;
    }

    private Long tryGetId(Object obj) {
        try {
            Method getId = obj.getClass().getMethod("getId");
            Object id = getId.invoke(obj);
            if (id instanceof Number number) {
                return number.longValue();
            }
        } catch (Exception ignored) {
            // No-op: some return types do not expose getId()
        }
        return null;
    }

    private String buildDetails(ProceedingJoinPoint joinPoint, Object result) {
        String args = Arrays.stream(joinPoint.getArgs())
                .map(arg -> arg == null ? "null" : arg.getClass().getSimpleName())
                .collect(Collectors.joining(", "));

        String resultType = result == null ? "void" : result.getClass().getSimpleName();
        return "method=" + joinPoint.getSignature().toShortString() + ", argsTypes=[" + args + "], resultType=" + resultType;
    }
}

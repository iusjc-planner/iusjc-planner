import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const isPublicEndpoint = (url: string): boolean => {
    return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password');
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (isPublicEndpoint(req.url)) {
        return next(req);
    }

    const token = authService.getToken();
    if (!token) {
        return next(req);
    }

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authReq);
};

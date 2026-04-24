import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { ForgotPasswordPage } from './forgot-password';
import { ResetPasswordPage } from './reset-password';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPasswordPage },
    { path: 'reset-password', component: ResetPasswordPage }
] as Routes;

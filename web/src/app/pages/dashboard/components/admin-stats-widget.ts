import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-admin-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Enseignants</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">24</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">3 nouveaux </span>
                <span class="text-muted-color">cette semaine</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Réservations en attente</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">7</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-clock text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">À approuver </span>
                <span class="text-muted-color">cette semaine</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Écoles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">6</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Actives </span>
                <span class="text-muted-color">dans le système</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ressources</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">156</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-server text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">142 disponibles </span>
                <span class="text-muted-color">14 en maintenance</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Étudiants</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">1,245</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-green-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Répartis </span>
                <span class="text-muted-color">dans 6 écoles</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Salles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">18</div>
                    </div>
                    <div class="flex items-center justify-center bg-indigo-100 dark:bg-indigo-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-home text-indigo-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">85% </span>
                <span class="text-muted-color">taux d'occupation</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Conflits détectés</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">2</div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-exclamation-circle text-red-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">À résoudre </span>
                <span class="text-muted-color">urgence</span>
            </div>
        </div>`
})
export class AdminStatsWidget {}

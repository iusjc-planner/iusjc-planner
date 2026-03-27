import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, CardModule],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-8">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Profil administrateur</h5>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Nom</label>
                            <input pInputText type="text" [(ngModel)]="profil.nom" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Prénom</label>
                            <input pInputText type="text" [(ngModel)]="profil.prenom" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium">Email</label>
                            <input pInputText type="email" [(ngModel)]="profil.email" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium">Téléphone</label>
                            <input pInputText type="tel" [(ngModel)]="profil.telephone" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <button pButton type="button" label="Enregistrer les modifications" icon="pi pi-check" class="p-button-success"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Photo de profil</h5>
                    <div class="text-center">
                        <div class="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="pi pi-user text-4xl text-gray-500"></i>
                        </div>
                        <button pButton type="button" label="Changer la photo" icon="pi pi-upload" class="p-button-outlined w-full"></button>
                    </div>
                </div>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Sécurité</h5>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Ancien mot de passe</label>
                            <input pInputText type="password" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Nouveau mot de passe</label>
                            <input pInputText type="password" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Confirmer le mot de passe</label>
                            <input pInputText type="password" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <button pButton type="button" label="Changer le mot de passe" icon="pi pi-lock" class="p-button-warning"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ProfilPage {
    profil = {
        nom: 'Admin',
        prenom: 'IUSJC',
        email: 'admin@iusjc.cm',
        telephone: '+237 6XX XXX XXX'
    };
}

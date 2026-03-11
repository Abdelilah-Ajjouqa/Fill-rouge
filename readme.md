# Cahier des Charges : FitManager — Plateforme Multi-Salle de Sport

**Projet :** FitManager  
**Date :** 11 Mars 2026  
**Stack Technique :** NestJS, React.js, MongoDB, TypeScript

---

## 1. Présentation du Projet

### 1.1 C'est quoi ?

FitManager est une plateforme web qui permet de gérer **plusieurs salles de sport** depuis un seul endroit. Chaque salle propose des activités (Boxe, Yoga, Musculation…), et chaque activité a son propre coach, son prix, sa capacité et ses membres.

### 1.2 Le problème qu'on résout

Les salles de sport utilisent souvent des cahiers ou des fichiers Excel pour gérer leurs membres et paiements. FitManager remplace tout ça avec une application simple et centralisée.

### 1.3 Objectifs

- **Multi-salle :** Gérer plusieurs salles de sport sur une seule plateforme.
- **Gestion par activité :** Chaque activité (Boxe, Yoga…) a son prix, son coach et sa liste de membres.
- **Suivi des paiements :** Savoir qui a payé, qui doit de l'argent, combien reste à payer.
- **Contrôle de capacité :** Si une activité est pleine (ex: 60/60), personne ne peut s'inscrire jusqu'à qu'une place se libère.

---

## 2. Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | NestJS (TypeScript) |
| Base de données | MongoDB (une seule base partagée) |
| Frontend | React.js, Tailwind CSS |
| Authentification | JWT (JSON Web Token) |

### 2.1 Architecture de la base de données

On utilise **une seule base de données** pour toutes les salles. Chaque document (utilisateur, activité, abonnement…) contient un champ `gymId` pour savoir à quelle salle il appartient. C'est plus simple à gérer et suffisant pour notre cas.

---

## 3. Les Rôles

Il y a **4 rôles** dans la plateforme, organisés comme une pyramide :

### 3.1 Super Admin (1 seul — le propriétaire de la plateforme)

- Crée et gère les salles de sport.
- Ajoute un Admin pour chaque salle.
- Voit les statistiques globales de toutes les salles.
- Peut suspendre ou activer une salle.

### 3.2 Admin (1 par salle — le propriétaire de la salle)

- Gère **sa propre salle** uniquement.
- Crée les activités (Boxe, Yoga…) avec : nom, prix mensuel, capacité max, planning.
- Ajoute les coachs et les assigne à des activités.
- Voit le chiffre d'affaires de sa salle.
- Voit tous les membres de sa salle.

### 3.3 Coach (responsable d'une activité)

- Ne voit que les membres inscrits à **son** activité.
- Peut ajouter de nouveaux membres à son activité.
- Voit le statut de paiement de ses membres (payé / pas payé).
- Gère les présences de ses séances.

### 3.4 Membre (adhérent)

- N'a **pas de compte** sur la plateforme (pas de login).
- Est inscrit et géré par le coach ou l'admin.
- Peut être inscrit à **plusieurs activités** dans la même salle.
- Son abonnement, ses paiements et son statut sont visibles par le coach et l'admin.

---

## 4. Les Modules

### 4.1 Module : Gestion des Salles (Gyms)

Le Super Admin peut créer des salles de sport.

**Données d'une salle :**
- Nom (ex: "FitClub Casablanca")
- Adresse
- Téléphone
- Logo
- Statut (active / suspendue)

### 4.2 Module : Gestion des Activités

L'Admin de chaque salle crée les activités proposées.

**Données d'une activité :**
- Nom (ex: "Kick-Boxing Adulte")
- Coach responsable
- Prix mensuel (ex: 300 DH)
- Capacité max (ex: 60 places)
- Planning (ex: Lundi et Mercredi, 16h00 → 17h00)
- Statut (active / inactive)

**Règles :**
- Si le nombre de membres actifs atteint la capacité max → l'activité est automatiquement **pleine**. Plus personne ne peut s'inscrire jusqu'à qu'une place se libère.
- Pas besoin de fermer manuellement — la capacité contrôle tout.

### 4.3 Module : Gestion des Membres

Les membres sont ajoutés par les coachs ou les admins. Ils appartiennent à **une salle** (pas à la plateforme).

**Données d'un membre :**
- Nom, Prénom
- Téléphone
- Date de naissance
- Photo (optionnel)
- Certificat médical (optionnel)

**Règles :**
- Un membre peut être inscrit à plusieurs activités dans la même salle (ex: Boxe + Yoga).
- Si deux activités ont le même horaire, le système affiche un **avertissement** mais ne bloque pas l'inscription (le membre choisira laquelle il attend chaque jour).

### 4.4 Module : Abonnements

Un abonnement lie un membre à une activité. C'est ici qu'on gère l'argent et l'accès.

**Données d'un abonnement :**
- Membre concerné
- Activité concernée
- Date de début
- Date de fin (calculée : début + 1 mois)
- Statut (actif / expiré / annulé)

**Exemple :**
> Karim s'inscrit à la Boxe le 01/01.  
> Prix : 300 DH/mois.  
> Son abonnement expire le 31/01.  
> S'il ne renouvelle pas → statut = expiré.

### 4.5 Module : Paiements

Chaque paiement est lié à un abonnement. Le système gère les **paiements partiels** (dettes).

**Données d'un paiement :**
- Abonnement concerné
- Montant payé
- Montant dû (total)
- Date du paiement

**Exemple :**
> L'abonnement de Karim coûte 300 DH.  
> Il paye 100 DH → le système affiche "Reste à payer : 200 DH".  
> Il paye 200 DH plus tard → dette = 0 DH.

### 4.6 Module : Tableau de Bord (Dashboard)

Chaque rôle voit un dashboard différent.

**Super Admin :**
- Nombre total de salles
- Nombre total de membres (toutes salles)
- Revenu global

**Admin :**
- Revenu de sa salle
- Nombre de membres actifs
- Activité la plus rentable
- Liste des membres avec abonnement expiré

**Coach :**
- Nombre de membres dans son activité (ex: 21/60)
- Liste des membres avec paiement en retard
- Prochaines séances

---

## 5. Modèle de Données

### A. Collection `gyms`
```
{
  name: String,
  address: String,
  phone: String,
  logo: String,
  isActive: Boolean,
  createdAt, updatedAt
}
```

### B. Collection `users` (Admin, Coach)
```
{
  gymId: ObjectId → gyms,
  firstName: String,
  lastName: String,
  email: String (unique),
  passwordHash: String,
  role: "SUPER_ADMIN" | "ADMIN" | "COACH",
  isActive: Boolean,
  createdAt, updatedAt
}
```
Note : Le Super Admin n'a pas de `gymId` (il gère la plateforme entière).

### C. Collection `members`
```
{
  gymId: ObjectId → gyms,
  firstName: String,
  lastName: String,
  phone: String,
  dateOfBirth: Date,
  photo: String,
  medicalCertificate: String,
  createdAt, updatedAt
}
```
Note : Les membres n'ont pas de mot de passe — ils ne se connectent pas.

### D. Collection `activities`
```
{
  gymId: ObjectId → gyms,
  name: String,
  coach: ObjectId → users,
  monthlyPrice: Number,
  maxCapacity: Number,
  schedule: [{ day: String, startTime: String, endTime: String }],
  isActive: Boolean,
  createdAt, updatedAt
}
```

### E. Collection `subscriptions`
```
{
  gymId: ObjectId → gyms,
  member: ObjectId → members,
  activity: ObjectId → activities,
  startDate: Date,
  endDate: Date,
  status: "active" | "expired" | "cancelled",
  createdAt, updatedAt
}
```

### F. Collection `payments`
```
{
  gymId: ObjectId → gyms,
  subscription: ObjectId → subscriptions,
  amount: Number,
  amountDue: Number,
  paidAt: Date,
  createdAt, updatedAt
}
```

---

## 6. API (Endpoints Principaux)

### Auth
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /auth/login | Tous | Se connecter |
| POST | /auth/register | Super Admin / Admin | Créer un compte (admin ou coach) |

### Gyms
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /gyms | Super Admin | Créer une salle |
| GET | /gyms | Super Admin | Lister toutes les salles |
| GET | /gyms/:id | Super Admin / Admin | Voir une salle |
| PATCH | /gyms/:id | Super Admin | Modifier une salle |
| DELETE | /gyms/:id | Super Admin | Supprimer une salle |

### Activities
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /activities | Admin | Créer une activité |
| GET | /activities | Admin / Coach | Lister (coach voit seulement les siennes) |
| PATCH | /activities/:id | Admin | Modifier |
| DELETE | /activities/:id | Admin | Supprimer |

### Members
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /members | Admin / Coach | Ajouter un membre |
| GET | /members | Admin / Coach | Lister (coach voit seulement ses membres) |
| GET | /members/:id | Admin / Coach | Voir un membre |
| PATCH | /members/:id | Admin / Coach | Modifier |
| DELETE | /members/:id | Admin | Supprimer |

### Subscriptions
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /subscriptions | Admin / Coach | Inscrire un membre à une activité |
| GET | /subscriptions | Admin / Coach | Lister les abonnements |
| PATCH | /subscriptions/:id | Admin | Modifier (annuler, renouveler) |

### Payments
| Méthode | Route | Qui | Description |
|---------|-------|-----|-------------|
| POST | /payments | Admin / Coach | Enregistrer un paiement |
| GET | /payments | Admin / Coach | Lister les paiements |
| GET | /payments/debts | Admin / Coach | Voir les dettes |

---

## 7. Règles Métier Résumées

1. **Un membre appartient à une salle**, pas à la plateforme.
2. **Un membre peut s'inscrire à plusieurs activités** dans la même salle.
3. **Si une activité est pleine** (capacité max atteinte) → inscription bloquée automatiquement.
4. **Si deux activités ont le même horaire** → avertissement affiché, mais inscription autorisée.
5. **Les paiements partiels sont autorisés** → le système calcule le reste à payer.
6. **L'abonnement expire automatiquement** après la période payée (1 mois par défaut).
7. **Les membres ne se connectent pas** — ils sont gérés par les coachs et admins.
8. **Chaque rôle ne voit que ce qui le concerne** (isolation des données par salle et par rôle).

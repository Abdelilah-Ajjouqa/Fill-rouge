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
- **Suivi des paiements :** Savoir qui a paye et qui est en retard.
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

- **Possède un compte** sur la plateforme avec un accès **lecture seule**.
- Est créé et géré par le coach ou l'admin (qui lui crée son compte).
- Peut être inscrit à **plusieurs activités** dans la même salle.
- Peut se connecter pour consulter :
  - Ses abonnements actifs et expirés
  - Son historique de paiements et son statut
  - Le planning de ses activités
- Peut modifier ses **informations de base** (photo, téléphone, email, mot de passe).
- Ne peut **pas modifier** les champs critiques (certificat médical, abonnements, paiements) — cela passe par le coach ou l'admin.

---

## 4. Les Modules

### 4.1 Module : Gestion des Salles (Gyms)

Le Super Admin peut créer des salles de sport.

**Données d'une salle :**
- Nom (ex: "FitClub Casablanca")
- Adresse
- Téléphone
- Logo (upload depuis l'appareil)
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

Les membres sont ajoutés par les coachs ou les admins. Ils appartiennent à **une salle** (pas à la plateforme). Ils possèdent un compte avec accès **lecture seule**.

**Données d'un membre :**
- Nom, Prénom
- Email
- Mot de passe
- Téléphone
- Date de naissance
- Photo (optionnel)
- Certificat médical (optionnel)

**Règles :**
- Un membre peut être inscrit à plusieurs activités dans la même salle (ex: Boxe + Yoga).
- Si deux activités ont le même horaire, le système affiche un **avertissement** mais ne bloque pas l'inscription (le membre choisira laquelle il attend chaque jour).
- Un membre peut se connecter pour consulter ses données ou modifier son profil de base (téléphone, email, mot de passe, photo).

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

Chaque paiement est lié à un abonnement. Le systeme accepte uniquement les **paiements complets** (pas de paiements partiels).

**Données d'un paiement :**
- Abonnement concerné
- Montant payé
- Montant dû (total)
- Date du paiement

**Exemple :**
> L'abonnement de Karim coûte 300 DH.  
> Il paye 300 DH en une fois → statut = paye.

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

**Membre :**
- Ses abonnements actifs (activités, dates, statut)
- Son historique de paiements et statut
- Le planning de ses activités (jours et horaires)

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
  email: String (unique),
  passwordHash: String,
  phone: String,
  dateOfBirth: Date,
  photo: String,
  medicalCertificate: String,
  createdAt, updatedAt
}
```
Note : Les membres peuvent consulter toutes leurs données et modifier uniquement leurs informations de base (téléphone, email, mot de passe, photo). Les champs critiques (abonnements, certificat médical) sont en lecture seule.

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
| POST | /auth/login | Tous (y compris membres) | Se connecter |
| POST | /auth/register | Super Admin / Admin | Créer un compte (admin, coach, ou membre) |
| GET | /auth/me | Tous (authentifié) | Voir son propre profil |
| PATCH | /auth/me | Tous (authentifié) | Modifier son propre profil de base (nom, téléphone, mot de passe) |

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
| PATCH | /members/:id | Admin / Coach | Modifier (tous les détails, y compris certificat médical) |
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
| GET | /payments/unpaid | Admin / Coach | Voir les paiements en attente |

---

## 7. Règles Métier Résumées

1. **Un membre appartient à une salle**, pas à la plateforme.
2. **Un membre peut s'inscrire à plusieurs activités** dans la même salle.
3. **Si une activité est pleine** (capacité max atteinte) → inscription bloquée automatiquement.
4. **Si deux activités ont le même horaire** → avertissement affiché, mais inscription autorisée.
5. **Les paiements complets sont obligatoires** → aucun paiement partiel n'est accepte.
6. **L'abonnement expire automatiquement** après la période payée (1 mois par défaut).
7. **Les membres ont un compte limité** — ils peuvent modifier leurs infos de base, mais leurs abonnements, paiements et plannings sont en lecture seule.
8. **Chaque rôle ne voit que ce qui le concerne** (isolation des données par salle et par rôle).

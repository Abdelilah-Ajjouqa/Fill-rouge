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
- **Suivi des paiements :** Savoir qui a payé et qui est en retard.
- **Contrôle de capacité :** Si une activité est pleine (ex: 60/60), personne ne peut s'inscrire jusqu'à ce qu'une place se libère.

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
- Si le nombre de membres actifs atteint la capacité max → l'activité est automatiquement **pleine**. Plus personne ne peut s'inscrire jusqu'à ce qu'une place se libère.
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

### 4.5 Module : Paiements

Chaque paiement est lié à un abonnement. Le système accepte uniquement les **paiements complets** (pas de paiements partiels).

**Données d'un paiement :**
- Abonnement concerné
- Montant payé
- Montant dû (total)
- Date du paiement

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


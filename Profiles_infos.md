# FitManager — Demo Accounts & Profiles Reference

> **Base URL:** [http://localhost:3200](http://localhost:3200) (Frontend)  
> **API Docs / Swagger:** [http://localhost:3201/api/docs](http://localhost:3201/api/docs)

---

## 1. Super Administrator (Platform Level)
Oversees all gym clubs, assigns gym owners/admins, inspects global telemetry.

| Role | Name | Email | Password | Phone |
|---|---|---|---|---|
| **Super Admin** | Alex Morgan | `admin@fitmanager.com` | `superadmin123` | `0600000000` |

---

## 2. Gym 1: IronPulse Fitness Club (Casablanca)
Multi-activity fitness club with 3 halls (*Main Arena*, *Zen Studio*, *Combat Octagon*).

### Staff & Management
| Role | Name | Email | Password | Hall / Specialty |
|---|---|---|---|---|
| **Gym Admin** | Tariq Mansouri | `admin@ironpulse.com` | `admin1234` | Facility Owner |
| **Coach** | Mehdi Benali | `coach.mehdi@ironpulse.com` | `coach1234` | Main Arena (HIIT) & Combat Octagon |
| **Coach** | Yasmine Idrissi | `coach.yasmine@ironpulse.com` | `coach1234` | Zen Studio (Vinyasa Yoga) |

### Registered Members
| Name | Email | Password | Phone | Activity & Status |
|---|---|---|---|---|
| **Karim Alaoui** | `karim.alaoui@gmail.com` | `member1234` | `0665111222` | Power & HIIT Conditioning (**Active**) |
| **Sara Bennani** | `sara.bennani@gmail.com` | `member1234` | `0665222333` | Vinyasa Flow Yoga (**Active**) |
| **Omar Chraibi** | `omar.chraibi@gmail.com` | `member1234` | `0665333444` | Boxing & Kickboxing (**Active**) |
| **Fatima Zahra Tazi** | `fatima.zahra@gmail.com` | `member1234` | `0665444555` | Vinyasa Flow Yoga (**Expired**) |
| **Amine El Otmani** | `amine.elotmani@gmail.com` | `member1234` | `0665556666` | Power & HIIT Conditioning (**Active**) |
| **Layla Kadiri** | `layla.kadiri@gmail.com` | `member1234` | `0665666777` | Boxing & Kickboxing (**Cancelled**) |

---

## 3. Gym 2: Titan Athletics Club (Marrakech)
Athletics club with CrossFit Box and Spinning Hall.

| Role | Name | Email | Password |
|---|---|---|---|
| **Gym Admin** | Samira Alami | `admin@titan.com` | `admin1234` |
| **Coach** | Khalid Berrada | `coach.khalid@titan.com` | `coach1234` |

---

## 4. Re-running the Seed Script
If you ever want to reset or re-populate the demo database:
```bash
# In projects/Fill-rouge/backend:
npm run seed:all
```

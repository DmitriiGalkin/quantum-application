# Архитектура

## Backend

```
Request

↓

Controller

↓

Service

↓

Repository

↓

Database
```

---

## Frontend

```
Page

↓

Hooks

↓

API

↓

Backend
```

---

## Repository

Один Repository — одна таблица.

Repository ничего не знает о других таблицах.

---

## Service

Service объединяет данные нескольких Repository.

Например

PlaceService

↓

PlaceRepository

↓

PlaceScheduleRepository

---

## DTO

DTO используются только между frontend и backend.

Repository работает только с моделями базы данных.
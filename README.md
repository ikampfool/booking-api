# Booking System API (NestJS)

## Overview

ระบบจอง Event ที่รองรับจำนวนที่นั่งจำกัด พร้อมระบบ Waitlist และการจัดการ Concurrency เพื่อป้องกันปัญหา overbooking

---

## Tech Stack

* NestJS
* TypeORM
* PostgreSQL (Docker)
* Jest (Unit + E2E Testing)

---

## Features

* จองที่นั่ง (Booking)
* จำกัดจำนวนที่นั่ง (maxSeats)
* ระบบ Waitlist อัตโนมัติ
* ยกเลิกการจอง (Cancel Booking)
* Promote ผู้ที่อยู่ใน Waitlist ขึ้นมาแทน
* รองรับ Concurrent Requests
* ป้องกัน Overbooking

---

## Core Logic

### Booking

* ถ้ามีที่ว่าง → สถานะ = `CONFIRMED`
* ถ้าเต็มแล้ว → สถานะ = `WAITLIST`

---

### Cancel Booking

#### กรณี สถานะเก่าเป็น WAITLIST

* ยกเลิกเฉย ๆ (ไม่กระทบจำนวนที่นั่ง)

#### กรณี สถานะเก่าเป็น CONFIRMED

* เปลี่ยนสถานะเป็น `CANCEL` → `PROMOTE WAITLIST` คนแรก

---

## Concurrency Handling
* Database Transaction**
* Pessimistic Lock
## เพื่อป้องกัน:
* Race condition
* Overbooking
* Duplicate promotion

---

## Testing

### Unit Test

* ทดสอบ business logic ที่ `booking.service`
  * event not found
  * duplicate booking
  * confirmed / waitlist
  * cancel + promote

---

### E2E Test
* ทดสอบผ่าน API จริง
* รองรับ:
  * จองแล้วได้ถ้ามีที่ว่าง
  * cancel แล้ว promote

---

## API

### Create Booking

```http
POST /bookings
```

```json
{
  "eventId": 1,
  "userId": 1
}
```

---

### Cancel Booking

```http
PATCH /bookings/:id/cancel
```

---

## Run Project

```bash
npm install
docker-compose up -d
npm run start:dev
```

---

## Run Test

```bash
npm run test
npm run test:e2e
```

---

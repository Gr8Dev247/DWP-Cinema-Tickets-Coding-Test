# DWP Cinema Tickets — JavaScript

Submission for the Department for Work and Pensions coding exercise. Template source: [dwp/cinema-tickets](https://github.com/dwp/cinema-tickets) (JavaScript folder only).

## Requirements

- [Node.js](https://nodejs.org/) **20.9+** (see `engines` in `package.json`).

## Install and test

```bash
npm install
npm test
```

Other scripts:

- `npm run test:watch` — re-run tests on file changes
- `npm run test:coverage` — coverage report

Tests use [Jest](https://jestjs.io/) with native ES modules (`"type": "module"`).

## What was implemented

`TicketService` (`src/pairtest/TicketService.js`) orchestrates:

1. Validation (invalid requests throw `InvalidPurchaseException` before any side effects).
2. Total payable amount → `TicketPaymentService.makePayment(accountId, totalAmountToPay)`.
3. Seats to reserve → `SeatReservationService.reserveSeat(accountId, totalSeatsToAllocate)`.

Payment runs before seat reservation so a seat is never held for an unpaid order.

Pricing and seat maths live in small pure helpers (`src/pairtest/lib/pricing.js`) with constants in `src/pairtest/lib/constants.js`.

### Business rules covered

| Rule | Handling |
|------|----------|
| Infant £0, Child £15, Adult £25 | `TICKET_PRICES` + `calculateAmount` |
| Infants get no seat | `calculateSeats` excludes infants |
| Max 25 tickets per purchase | Rejects when total ticket count exceeds 25 |
| Child/infant without adult | Rejects when there are children or infants but zero adults |
| Infants on an adult’s lap | **Assumption:** at most as many infants as adults (`infants ≤ adults`); one lap per adult |

Invalid inputs rejected include: non-positive `accountId`; empty request list; items that are not `TicketTypeRequest` instances; zero or negative ticket counts per request; baskets that violate the rules above.

import { TICKET_PRICES, TICKET_TYPES } from './constants.js';

/**
 * Reduces an array of TicketTypeRequest objects into per-type counts plus a
 * total. Multiple requests of the same type are aggregated.
 *
 * @param {import('./TicketTypeRequest.js').default[]} requests
 * @returns {{ adult: number, child: number, infant: number, total: number }}
 */
export function summariseRequests(requests) {
  const counts = { adult: 0, child: 0, infant: 0 };

  for (const request of requests) {
    const type = request.getTicketType();
    const noOfTickets = request.getNoOfTickets();

    if (type === TICKET_TYPES.ADULT) counts.adult += noOfTickets;
    else if (type === TICKET_TYPES.CHILD) counts.child += noOfTickets;
    else if (type === TICKET_TYPES.INFANT) counts.infant += noOfTickets;
  }

  return { ...counts, total: counts.adult + counts.child + counts.infant };
}

/**
 * Total amount payable in whole pounds. Infants are free.
 */
export function calculateAmount({ adult, child, infant }) {
  return (
    adult * TICKET_PRICES.ADULT
    + child * TICKET_PRICES.CHILD
    + infant * TICKET_PRICES.INFANT
  );
}

/**
 * Total seats to reserve. Infants sit on an adult's lap and do not get a seat.
 */
export function calculateSeats({ adult, child }) {
  return adult + child;
}

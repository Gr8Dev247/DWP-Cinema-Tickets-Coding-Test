export const TICKET_TYPES = Object.freeze({
  ADULT: 'ADULT',
  CHILD: 'CHILD',
  INFANT: 'INFANT',
});

export const TICKET_PRICES = Object.freeze({
  [TICKET_TYPES.ADULT]: 25,
  [TICKET_TYPES.CHILD]: 15,
  [TICKET_TYPES.INFANT]: 0,
});

export const MAX_TICKETS_PER_PURCHASE = 25;

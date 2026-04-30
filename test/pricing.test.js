import {
  calculateAmount,
  calculateSeats,
  summariseRequests,
} from '../src/pairtest/lib/pricing.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

describe('summariseRequests', () => {
  it('returns zero counts for an empty array', () => {
    expect(summariseRequests([])).toEqual({
      adult: 0, child: 0, infant: 0, total: 0,
    });
  });

  it('counts a single request', () => {
    const requests = [new TicketTypeRequest('ADULT', 3)];

    expect(summariseRequests(requests)).toEqual({
      adult: 3, child: 0, infant: 0, total: 3,
    });
  });

  it('aggregates multiple requests of the same type', () => {
    const requests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('ADULT', 1),
    ];

    expect(summariseRequests(requests)).toEqual({
      adult: 3, child: 0, infant: 0, total: 3,
    });
  });

  it('aggregates a mixed basket', () => {
    const requests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ];

    expect(summariseRequests(requests)).toEqual({
      adult: 2, child: 1, infant: 1, total: 4,
    });
  });
});

describe('calculateAmount', () => {
  it('returns 0 when no tickets are requested', () => {
    expect(calculateAmount({ adult: 0, child: 0, infant: 0 })).toBe(0);
  });

  it('charges £25 per adult', () => {
    expect(calculateAmount({ adult: 1, child: 0, infant: 0 })).toBe(25);
    expect(calculateAmount({ adult: 4, child: 0, infant: 0 })).toBe(100);
  });

  it('charges £15 per child', () => {
    expect(calculateAmount({ adult: 0, child: 2, infant: 0 })).toBe(30);
  });

  it('does not charge for infants', () => {
    expect(calculateAmount({ adult: 1, child: 0, infant: 5 })).toBe(25);
  });

  it('sums a mixed basket correctly', () => {
    // 2 adults (£50) + 3 children (£45) + 4 infants (£0) = £95
    expect(calculateAmount({ adult: 2, child: 3, infant: 4 })).toBe(95);
  });
});

describe('calculateSeats', () => {
  it('returns 0 when there are no tickets', () => {
    expect(calculateSeats({ adult: 0, child: 0, infant: 0 })).toBe(0);
  });

  it('reserves a seat for each adult', () => {
    expect(calculateSeats({ adult: 3, child: 0, infant: 0 })).toBe(3);
  });

  it('reserves a seat for each child', () => {
    expect(calculateSeats({ adult: 0, child: 2, infant: 0 })).toBe(2);
  });

  it('does not reserve seats for infants (they sit on an adult\'s lap)', () => {
    expect(calculateSeats({ adult: 2, child: 1, infant: 5 })).toBe(3);
  });
});

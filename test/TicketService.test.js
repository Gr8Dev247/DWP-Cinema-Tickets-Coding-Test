import { jest } from '@jest/globals';
import TicketService from '../src/pairtest/TicketService.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

function createService() {
  const paymentService = { makePayment: jest.fn() };
  const seatService = { reserveSeat: jest.fn() };
  const service = new TicketService(paymentService, seatService);
  return { service, paymentService, seatService };
}

describe('TicketService.purchaseTickets - happy path', () => {
  it('charges £25 and reserves 1 seat for a single adult', () => {
    const { service, paymentService, seatService } = createService();

    service.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));

    expect(paymentService.makePayment).toHaveBeenCalledTimes(1);
    expect(paymentService.makePayment).toHaveBeenCalledWith(1, 25);
    expect(seatService.reserveSeat).toHaveBeenCalledTimes(1);
    expect(seatService.reserveSeat).toHaveBeenCalledWith(1, 1);
  });

  it('prices and reserves correctly for adults plus a child', () => {
    const { service, paymentService, seatService } = createService();

    service.purchaseTickets(
      42,
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 1),
    );

    // 2 * £25 + 1 * £15 = £65, 3 seats
    expect(paymentService.makePayment).toHaveBeenCalledWith(42, 65);
    expect(seatService.reserveSeat).toHaveBeenCalledWith(42, 3);
  });

  it('does not charge or reserve a seat for infants', () => {
    const { service, paymentService, seatService } = createService();

    service.purchaseTickets(
      7,
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 2),
    );

    // 2 * £25 + 1 * £15 + 2 * £0 = £65, 3 seats (infants on a lap)
    expect(paymentService.makePayment).toHaveBeenCalledWith(7, 65);
    expect(seatService.reserveSeat).toHaveBeenCalledWith(7, 3);
  });

  it('aggregates multiple requests of the same type', () => {
    const { service, paymentService, seatService } = createService();

    service.purchaseTickets(
      9,
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('CHILD', 1),
    );

    // 3 adults * £25 + 2 children * £15 = £105, 5 seats
    expect(paymentService.makePayment).toHaveBeenCalledWith(9, 105);
    expect(seatService.reserveSeat).toHaveBeenCalledWith(9, 5);
  });

  it('handles the maximum allowed basket (25 adults)', () => {
    const { service, paymentService, seatService } = createService();

    service.purchaseTickets(1, new TicketTypeRequest('ADULT', 25));

    expect(paymentService.makePayment).toHaveBeenCalledWith(1, 625);
    expect(seatService.reserveSeat).toHaveBeenCalledWith(1, 25);
  });

  it('takes payment before reserving seats', () => {
    // We pay first so we never hold a seat for an order that did not pay.
    const { service, paymentService, seatService } = createService();
    const callOrder = [];
    paymentService.makePayment.mockImplementation(() => callOrder.push('pay'));
    seatService.reserveSeat.mockImplementation(() => callOrder.push('reserve'));

    service.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));

    expect(callOrder).toEqual(['pay', 'reserve']);
  });
});

describe('TicketService.purchaseTickets - accountId validation', () => {
  // Anything other than a positive integer is invalid per the brief
  // ("All accounts with an id greater than zero are valid").
  const invalidAccountIds = [
    ['zero', 0],
    ['a negative integer', -1],
    ['a non-integer number', 1.5],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['a numeric string', '1'],
    ['null', null],
    ['undefined', undefined],
    ['a boolean', true],
    ['an object', {}],
  ];

  it.each(invalidAccountIds)('throws InvalidPurchaseException for %s', (_label, accountId) => {
    const { service } = createService();

    expect(() => service.purchaseTickets(accountId, new TicketTypeRequest('ADULT', 1)))
      .toThrow(InvalidPurchaseException);
  });

  it('does not call payment or seat services when accountId is invalid', () => {
    const { service, paymentService, seatService } = createService();

    expect(() => service.purchaseTickets(0, new TicketTypeRequest('ADULT', 1)))
      .toThrow(InvalidPurchaseException);

    expect(paymentService.makePayment).not.toHaveBeenCalled();
    expect(seatService.reserveSeat).not.toHaveBeenCalled();
  });

  it('uses a descriptive exception message', () => {
    const { service } = createService();

    expect(() => service.purchaseTickets(0, new TicketTypeRequest('ADULT', 1)))
      .toThrow('accountId must be a positive integer');
  });
});

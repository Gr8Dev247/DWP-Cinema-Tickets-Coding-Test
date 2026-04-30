import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import { MAX_TICKETS_PER_PURCHASE } from './lib/constants.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketTypeRequest from './lib/TicketTypeRequest.js';
import {
  calculateAmount,
  calculateSeats,
  summariseRequests,
} from './lib/pricing.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  #paymentService;

  #seatService;

  /**
   * Dependencies are injected so the service is testable without touching the
   * real third-party implementations. Defaults preserve the no-arg
   * `new TicketService()` usage.
   */
  constructor(
    paymentService = new TicketPaymentService(),
    seatService = new SeatReservationService(),
  ) {
    this.#paymentService = paymentService;
    this.#seatService = seatService;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountId(accountId);
    this.#validateTicketRequests(ticketTypeRequests);

    const counts = summariseRequests(ticketTypeRequests);
    this.#validateBasketTotals(counts);

    // Pay first, reserve second: never reserve a seat for an unpaid order.
    this.#paymentService.makePayment(accountId, calculateAmount(counts));
    this.#seatService.reserveSeat(accountId, calculateSeats(counts));
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('accountId must be a positive integer');
    }
  }

  #validateTicketRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException(
        'At least one ticket type request must be provided',
      );
    }

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(
          'Each ticket request must be a TicketTypeRequest',
        );
      }

      // TicketTypeRequest's own constructor guarantees noOfTickets is an
      // integer, but does not stop zero or negative values - we reject those
      // here so callers cannot smuggle in nonsense baskets.
      if (request.getNoOfTickets() <= 0) {
        throw new InvalidPurchaseException(
          'Number of tickets must be a positive integer',
        );
      }
    }
  }

  #validateBasketTotals(counts) {
    if (counts.total > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${MAX_TICKETS_PER_PURCHASE} tickets at a time`,
      );
    }

    if (counts.adult === 0 && (counts.child > 0 || counts.infant > 0)) {
      throw new InvalidPurchaseException(
        'Child and Infant tickets cannot be purchased without an Adult ticket',
      );
    }
  }
}

import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
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

    const counts = summariseRequests(ticketTypeRequests);

    // Pay first, reserve second: never reserve a seat for an unpaid order.
    this.#paymentService.makePayment(accountId, calculateAmount(counts));
    this.#seatService.reserveSeat(accountId, calculateSeats(counts));
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('accountId must be a positive integer');
    }
  }
}

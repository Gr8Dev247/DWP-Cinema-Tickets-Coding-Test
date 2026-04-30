import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
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
    const counts = summariseRequests(ticketTypeRequests);

    // Pay first, reserve second: never reserve a seat for an unpaid order.
    this.#paymentService.makePayment(accountId, calculateAmount(counts));
    this.#seatService.reserveSeat(accountId, calculateSeats(counts));
  }
}

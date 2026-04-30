import TicketService from '../src/pairtest/TicketService.js';

describe('TicketService (toolchain check)', () => {
  it('can be instantiated', () => {
    expect(() => new TicketService()).not.toThrow();
  });
});

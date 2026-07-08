import { getNextOccupiedRoom } from '../src/rotation';

const ROOMS = ['102', '103', '104', '105'];
const ALL_OCCUPIED = new Set(ROOMS);

describe('getNextOccupiedRoom', () => {
  test('ASC advances forward by one', () => {
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '102', ALL_OCCUPIED)).toBe('103');
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '104', ALL_OCCUPIED)).toBe('105');
  });

  test('ASC wraps around at the end', () => {
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '105', ALL_OCCUPIED)).toBe('102');
  });

  test('DESC advances backward by one', () => {
    expect(getNextOccupiedRoom(ROOMS, 'DESC', '105', ALL_OCCUPIED)).toBe('104');
    expect(getNextOccupiedRoom(ROOMS, 'DESC', '103', ALL_OCCUPIED)).toBe('102');
  });

  test('DESC wraps around at the start', () => {
    expect(getNextOccupiedRoom(ROOMS, 'DESC', '102', ALL_OCCUPIED)).toBe('105');
  });

  test('null currentRoom (new duty) starts at roomList[0] for ASC', () => {
    expect(getNextOccupiedRoom(ROOMS, 'ASC', null, ALL_OCCUPIED)).toBe('102');
  });

  test('null currentRoom (new duty) starts at roomList[n-1] for DESC', () => {
    expect(getNextOccupiedRoom(ROOMS, 'DESC', null, ALL_OCCUPIED)).toBe('105');
  });

  test('skips unoccupied rooms', () => {
    const occupied = new Set(['102', '105']);
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '102', occupied)).toBe('105');
  });

  test('currentRoom no longer in roomList (deleted room) pivots from index 0', () => {
    const occupied = new Set(['103', '105']);
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '999', occupied)).toBe('103');
  });

  test('single occupied room returns that room every time, no infinite loop', () => {
    const occupied = new Set(['104']);
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '102', occupied)).toBe('104');
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '104', occupied)).toBe('104');
  });

  test('zero occupied rooms returns null', () => {
    expect(getNextOccupiedRoom(ROOMS, 'ASC', '102', new Set())).toBeNull();
  });

  test('repeated calls with the same inputs are idempotent', () => {
    const a = getNextOccupiedRoom(ROOMS, 'ASC', '102', ALL_OCCUPIED);
    const b = getNextOccupiedRoom(ROOMS, 'ASC', '102', ALL_OCCUPIED);
    expect(a).toBe(b);
  });

  test('empty roomList returns null', () => {
    expect(getNextOccupiedRoom([], 'ASC', null, new Set())).toBeNull();
  });
});

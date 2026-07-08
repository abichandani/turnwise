function getActiveResidentRoomSet_() {
  var set = new Set();
  getSheetRows_(SHEET_NAMES.USERS).forEach(function (u) {
    if (!u.is_deleted && ROOM_LIST.indexOf(u.room_number) !== -1) {
      set.add(u.room_number);
    }
  });
  return set;
}

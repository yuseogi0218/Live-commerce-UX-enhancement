const rooms = [];

const addRoom = ({ broadcastId, broadcastUrl }) => {

  const existingRoom = rooms.find((room) => room.broadcastId === broadcastId && room.broadcastUrl === broadcastUrl);

  if(!broadcastUrl || !broadcastId) return { error: 'broadcastUrl is required.' };
  if(existingRoom) return { error: 'broadcastUrl is taken.' };

  const room = { broadcastId, broadcastUrl };

  rooms.push(room);

  return { room };
}

const removeRoom = (broadcastId) => {
  const index = rooms.findIndex((room) => room.broadcastId === broadcastId);

  if(index !== -1) return rooms.splice(index, 1)[0];
}

const getRoomByBroadcastId = (broadcastId) => {
  const room = rooms.find((room) => room.broadcastId === broadcastId);

  if (!room) return {error: 'there is no room'};

  return {room};
};

module.exports = { addRoom, removeRoom, getRoomByBroadcastId};
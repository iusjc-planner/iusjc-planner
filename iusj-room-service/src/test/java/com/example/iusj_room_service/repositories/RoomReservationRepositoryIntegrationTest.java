package com.example.iusj_room_service.repositories;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.iusj_room_service.entities.RoomReservation;

@DataJpaTest
class RoomReservationRepositoryIntegrationTest {

    @Autowired
    private RoomReservationRepository repository;

    @Test
    void findReservedRoomIds_returnsOnlyOverlappingActiveReservations() {
        LocalDateTime base = LocalDateTime.of(2026, 4, 1, 10, 0);

        repository.save(buildReservation(1L, base.minusHours(1), base.plusHours(1), RoomReservation.Status.RESERVED));
        repository.save(buildReservation(2L, base.minusHours(3), base.minusHours(2), RoomReservation.Status.RESERVED));
        repository.save(buildReservation(3L, base.minusMinutes(30), base.plusMinutes(30), RoomReservation.Status.CANCELLED));
        repository.save(buildReservation(4L, base.minusMinutes(30), base.plusMinutes(30), RoomReservation.Status.CONFIRMED));

        List<Long> reservedIds = repository.findReservedRoomIds(
                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED),
                base,
                base.plusHours(2));

        assertTrue(reservedIds.contains(1L));
        assertTrue(reservedIds.contains(4L));
        assertFalse(reservedIds.contains(2L));
        assertFalse(reservedIds.contains(3L));
    }

    @Test
        void existsConflict_detectsConflicts() {
        LocalDateTime start = LocalDateTime.of(2026, 4, 2, 8, 0);
        LocalDateTime end = LocalDateTime.of(2026, 4, 2, 10, 0);

        repository.save(buildReservation(9L, start, end, RoomReservation.Status.CONFIRMED));

        boolean overlapConflict = repository.existsConflict(
                9L,
                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED),
                start.plusMinutes(30),
                end.plusMinutes(30));

        boolean cancelledIgnored = repository.existsConflict(
                9L,
                List.of(RoomReservation.Status.CANCELLED),
                start.plusMinutes(30),
                end.plusMinutes(30));

        boolean touchingBoundaryNoConflict = repository.existsConflict(
                9L,
                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED),
                end,
                end.plusHours(1));

        assertTrue(overlapConflict);
        assertFalse(cancelledIgnored);
        assertFalse(touchingBoundaryNoConflict);
    }

        @Test
        void findReservedRoomIds_handlesMultipleRoomsAndHighVolume() {
                LocalDateTime windowStart = LocalDateTime.of(2026, 4, 3, 9, 0);
                LocalDateTime windowEnd = windowStart.plusHours(2);

                for (int i = 0; i < 80; i++) {
                        RoomReservation.Status status = (i % 4 == 0)
                                        ? RoomReservation.Status.CANCELLED
                                        : RoomReservation.Status.RESERVED;
                        repository.save(buildReservation(100L + i, windowStart.minusHours(5), windowStart.minusHours(3), status));
                }

                repository.save(buildReservation(200L, windowStart.minusMinutes(30), windowStart.plusMinutes(30), RoomReservation.Status.RESERVED));
                repository.save(buildReservation(201L, windowStart.plusMinutes(15), windowStart.plusMinutes(45), RoomReservation.Status.CONFIRMED));
                repository.save(buildReservation(202L, windowStart.minusMinutes(20), windowStart.plusMinutes(20), RoomReservation.Status.CANCELLED));
                repository.save(buildReservation(203L, windowEnd, windowEnd.plusHours(1), RoomReservation.Status.RESERVED));

                List<Long> reservedIds = repository.findReservedRoomIds(
                                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED),
                                windowStart,
                                windowEnd);

                assertTrue(reservedIds.contains(200L));
                assertTrue(reservedIds.contains(201L));
                assertFalse(reservedIds.contains(202L));
                assertFalse(reservedIds.contains(203L));
                assertEquals(2, reservedIds.stream().filter(id -> id == 200L || id == 201L).count());
        }

    private RoomReservation buildReservation(Long roomId, LocalDateTime startTime, LocalDateTime endTime,
            RoomReservation.Status status) {
        RoomReservation reservation = new RoomReservation();
        reservation.setRoomId(roomId);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus(status);
        return reservation;
    }
}
